import os
from ultralytics import YOLO
from app.config import MODEL_PATH
from app.utils.logger import setup_logger
import torch
logger = setup_logger("Detector")

class ObjectDetector:
    def __init__(self):
        if not os.path.exists(MODEL_PATH):
            logger.error(f"Model not found at: {MODEL_PATH}")
            raise FileNotFoundError(f"Model not found: {MODEL_PATH}")
        logger.info(f"Loading model from {MODEL_PATH}")
        self.model = YOLO(MODEL_PATH)

    def detect(self, frame):
        """
    Detects objects in the given frame and returns a list of bounding boxes 
    in (x_center, y_center, width, height) format. Filters out detections 
    with confidence < 0.4 and invalid crops.
    
    Parameters:
        frame (np.ndarray): Input image.

    Returns:
        List[List[float]]: List of bounding boxes in xywh format.
        """
        results = self.model.predict(frame, device="cuda" if torch.cuda.is_available() else "cpu")
    
        if not results or not hasattr(results[0], "boxes") or results[0].boxes is None:
            return []

        boxes_xywh = []
        for result in results[0].boxes.data:
            x1, y1, x2, y2 = map(int, result[:4])
            conf = float(result[4])
        
            if conf < 0.4:
                continue

        # Crop to verify it's a valid face region
            face_image = frame[y1:y2, x1:x2]
            if face_image.size == 0:
                continue

        # Convert to (x_center, y_center, width, height)
            width = x2 - x1
            height = y2 - y1
            x_center = x1 + width / 2
            y_center = y1 + height / 2

            boxes_xywh.append([x_center, y_center, width, height])

        return boxes_xywh
