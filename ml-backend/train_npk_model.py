import os
from dataclasses import dataclass

import pandas as pd
import torch
from PIL import Image
from torch import nn
from torch.utils.data import DataLoader, Dataset
from torchvision import transforms

from app.npk_model import NPKRegressor


@dataclass
class TrainConfig:
    csv_path: str = "data/labels.csv"
    image_dir: str = "data/images"
    epochs: int = 15
    batch_size: int = 16
    learning_rate: float = 3e-4
    output_path: str = "models/npk_resnet50.pth"


class SoilDataset(Dataset):
    def __init__(self, df: pd.DataFrame, image_dir: str, transform):
        self.df = df.reset_index(drop=True)
        self.image_dir = image_dir
        self.transform = transform

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        image_path = os.path.join(self.image_dir, row["image_name"])
        image = Image.open(image_path).convert("RGB")
        image = self.transform(image)
        target = torch.tensor([row["N"], row["P"], row["K"], row["pH"]], dtype=torch.float32)
        return image, target


def train():
    cfg = TrainConfig()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(degrees=20),
        transforms.ColorJitter(brightness=0.25),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    df = pd.read_csv(cfg.csv_path)
    dataset = SoilDataset(df, cfg.image_dir, train_transform)
    loader = DataLoader(dataset, batch_size=cfg.batch_size, shuffle=True, num_workers=0)

    model = NPKRegressor().to(device)
    criterion = nn.HuberLoss()
    optimizer = torch.optim.AdamW(model.parameters(), lr=cfg.learning_rate)

    model.train()
    for epoch in range(cfg.epochs):
        running_loss = 0.0
        for images, targets in loader:
            images = images.to(device)
            targets = targets.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, targets)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()
        print(f"Epoch {epoch + 1}/{cfg.epochs} - loss: {running_loss / max(1, len(loader)):.4f}")

    os.makedirs(os.path.dirname(cfg.output_path), exist_ok=True)
    torch.save(model.state_dict(), cfg.output_path)
    print(f"Saved model weights to {cfg.output_path}")


if __name__ == "__main__":
    train()
