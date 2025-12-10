const { generateDescription, chatWithAi } = require('../src/controllers/aiController');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Mock Google Generative AI
jest.mock('@google/generative-ai');

describe('AI Controller Tests', () => {
    let req, res, next;
    let generateContentMock;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();

        generateContentMock = jest.fn().mockResolvedValue({
            response: { text: () => 'AI Generated Content' }
        });

        GoogleGenerativeAI.mockImplementation(() => ({
            getGenerativeModel: jest.fn().mockReturnValue({
                generateContent: generateContentMock
            })
        }));
    });

    describe('generateDescription', () => {
        it('should generate description successfully', async () => {
            req.body = { prompt: 'Test Prompt' };
            await generateDescription(req, res, next);

            expect(generateContentMock).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                description: 'AI Generated Content'
            }));
        });

        it('should handle API errors', async () => {
            generateContentMock.mockRejectedValue(new Error('AI API Error'));
            await generateDescription(req, res, next);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe('chatWithAi', () => {
        it('should return chat response', async () => {
            req.body = { message: 'Hello' };
            await chatWithAi(req, res, next);

            expect(generateContentMock).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                reply: 'AI Generated Content'
            }));
        });
    });
});
