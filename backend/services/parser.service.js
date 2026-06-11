import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';

const MAX_TEXT_LENGTH = 6000;

export async function extractTextFromPDF(buffer) {
  try {
    const data = await pdfParse(buffer);
    const text = data.text?.trim() || '';
    if (text.length < 100) {
      return `[PDF_WARNING: This PDF may be image-based or scanned — extracted text is very short (${text.length} chars). Please paste the text manually for best results.]\n${text}`;
    }
    return text.substring(0, MAX_TEXT_LENGTH);
  } catch (err) {
    console.error('[extractTextFromPDF] Error:', err.message);
    throw new Error(`Failed to parse PDF: ${err.message}`);
  }
}

export async function extractTextFromDOCX(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value?.trim() || '';
    return text.substring(0, MAX_TEXT_LENGTH);
  } catch (err) {
    console.error('[extractTextFromDOCX] Error:', err.message);
    throw new Error(`Failed to parse DOCX: ${err.message}`);
  }
}

export async function extractText(buffer, mimetype) {
  if (mimetype === 'application/pdf') {
    return extractTextFromPDF(buffer);
  }
  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword'
  ) {
    return extractTextFromDOCX(buffer);
  }
  throw new Error(`Unsupported mimetype for text extraction: ${mimetype}`);
}

export default extractText;
