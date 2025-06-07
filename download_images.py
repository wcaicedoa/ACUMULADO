import os
import sys
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup


def download_images(url: str, output_dir: str = "images") -> None:
    """Download all images from the given URL into output_dir."""
    os.makedirs(output_dir, exist_ok=True)

    try:
        response = requests.get(url)
        response.raise_for_status()
    except requests.RequestException as exc:
        print(f"Error fetching {url}: {exc}")
        return

    soup = BeautifulSoup(response.text, "html.parser")
    images = soup.find_all("img")

    for img in images:
        src = img.get("src")
        if not src:
            continue

        img_url = urljoin(url, src)
        img_name = os.path.basename(img_url.split("?")[0])
        if not img_name:
            # Skip images without a valid basename
            continue
        dest_path = os.path.join(output_dir, img_name)

        try:
            img_resp = requests.get(img_url)
            img_resp.raise_for_status()
        except requests.RequestException as exc:
            print(f"Failed to download {img_url}: {exc}")
            continue

        with open(dest_path, "wb") as fh:
            fh.write(img_resp.content)
        print(f"Downloaded {img_url} -> {dest_path}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python download_images.py <url> [output_dir]")
        sys.exit(1)

    download_images(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else "images")
