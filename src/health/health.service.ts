import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class HealthService {
  check() {
    return {
      status: 'ok-workflow-github-actions-2',
      timestamp: new Date().toISOString(),
    };
  }

  probe() {
    const timestamp = new Date().toISOString();
    const hash = createHash('sha256')
      .update(`ok:${timestamp}`)
      .digest('hex');
    return { status: 'ok', hash, timestamp };
  }
}
