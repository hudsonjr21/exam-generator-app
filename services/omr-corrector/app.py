import cv2
import numpy as np
from flask import Flask, request, jsonify
import imutils

app = Flask(__name__)

def find_and_split_sheets(img):
    h, w, _ = img.shape
    if h < w * 1.2:
        return [img]

    midpoint = h // 2
    top_half = img[0:midpoint, :]
    bottom_half = img[midpoint:h, :]

    def contains_valid_card(image_part):
        gray = cv2.cvtColor(image_part, cv2.COLOR_BGR2GRAY)
        thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        bubble_contours = 0
        for c in contours:
            (x, y, w, h) = cv2.boundingRect(c)
            aspect_ratio = w / float(h)
            if 10 < w < 40 and 10 < h < 40 and 0.7 <= aspect_ratio <= 1.3:
                bubble_contours += 1

        return bubble_contours > 20

    if contains_valid_card(top_half) and contains_valid_card(bottom_half):
        return [top_half, bottom_half]
    else:
        return [img]

def process_single_sheet(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edged = cv2.Canny(blurred, 75, 200)

    contours = cv2.findContours(edged.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    contours = imutils.grab_contours(contours)

    doc_contour = None
    if len(contours) > 0:
        contours = sorted(contours, key=cv2.contourArea, reverse=True)
        for c in contours:
            peri = cv2.arcLength(c, True)
            approx = cv2.approxPolyDP(c, 0.02 * peri, True)
            if len(approx) == 4:
                doc_contour = approx
                break

    if doc_contour is None:
        return {"error": "Não foi possível encontrar o contorno do cartão-resposta na imagem."}

    points = doc_contour.reshape(4, 2)
    rect = np.zeros((4, 2), dtype="float32")

    s = points.sum(axis=1)
    rect[0] = points[np.argmin(s)]
    rect[2] = points[np.argmax(s)]

    diff = np.diff(points, axis=1)
    rect[1] = points[np.argmin(diff)]
    rect[3] = points[np.argmax(diff)]

    (tl, tr, br, bl) = rect
    widthA = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2))
    widthB = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))
    maxWidth = max(int(widthA), int(widthB))

    heightA = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
    heightB = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))
    maxHeight = max(int(heightA), int(heightB))

    dst = np.array([
        [0, 0],
        [maxWidth - 1, 0],
        [maxWidth - 1, maxHeight - 1],
        [0, maxHeight - 1]], dtype="float32")

    M = cv2.getPerspectiveTransform(rect, dst)
    warped = cv2.warpPerspective(gray, M, (maxWidth, maxHeight))

    thresh = cv2.threshold(warped, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)[1]

    contours = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    contours = imutils.grab_contours(contours)

    bubble_contours = []
    for c in contours:
        (x, y, w, h) = cv2.boundingRect(c)
        aspect_ratio = w / float(h)
        if 20 < w < 40 and 20 < h < 40 and 0.8 <= aspect_ratio <= 1.2:
            bubble_contours.append(c)

    bubble_contours.sort(key=lambda c: cv2.boundingRect(c)[1])

    result = { "student_id": "01", "exam_version": "A", "answers": {} }

    answer_contours = bubble_contours[-50:]
    rows = [answer_contours[i:i+5] for i in range(0, len(answer_contours), 5)]

    for i, row_contours in enumerate(rows):
        marked_index = -1
        max_filled = 0
        for j, c in enumerate(sorted(row_contours, key=lambda c: cv2.boundingRect(c)[0])):
            mask = np.zeros(thresh.shape, dtype="uint8")
            cv2.drawContours(mask, [c], -1, 255, -1)
            filled_pixels = cv2.countNonZero(cv2.bitwise_and(thresh, thresh, mask=mask))
            if filled_pixels > max_filled and filled_pixels > 200:
                max_filled = filled_pixels
                marked_index = j
        question_number = i + 1
        result["answers"][question_number] = chr(65 + marked_index) if marked_index != -1 else "N/A"

    return result

@app.route('/process', methods=['POST'])
def process_correction_request():
    if 'student_list' not in request.files:
        return jsonify({"error": "Lista de alunos não enviada."}), 400

    answer_sheets_files = request.files.getlist('answer_sheets')
    if not answer_sheets_files:
        return jsonify({"error": "Nenhum cartão-resposta enviado."}), 400

    all_results = []
    for sheet_file in answer_sheets_files:
        try:
            nparr = np.frombuffer(sheet_file.read(), np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            individual_sheets = find_and_split_sheets(img)
            for i, sheet_img in enumerate(individual_sheets):
                result_data = process_single_sheet(sheet_img)
                all_results.append({
                    "originalFileName": sheet_file.filename,
                    "sheetPart": i + 1,
                    "data": result_data
                })
        except Exception as e:
            all_results.append({
                "originalFileName": sheet_file.filename,
                "error": f"Falha crítica ao processar imagem: {str(e)}"
            })

    return jsonify({
        "message": "Processamento de imagens concluído.",
        "results": all_results
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
