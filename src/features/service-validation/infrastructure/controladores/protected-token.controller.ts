import { Request, Response } from 'express';
import { ValidateProtectedTokenUseCase } from '../../application/validate-protected-token.use-case';

export class ProtectedTokenController {
  constructor(private readonly validateProtectedTokenUseCase: ValidateProtectedTokenUseCase) {}

  public async validateProtectedToken(req: Request, res: Response): Promise<void> {
    try {
      const { protectedToken } = req.body;
      const result = this.validateProtectedTokenUseCase.execute(protectedToken);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }

      res.json({ success: true, data: result.data });
    } catch (error) {
      console.error('❌ Error validating protected token:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error interno del servidor' });
    }
  }
}
