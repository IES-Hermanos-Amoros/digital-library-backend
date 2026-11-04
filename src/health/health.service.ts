import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  check() {
    return {
      status: 'ok-workflow-github-actions-2',
      timestamp: new Date().toISOString(),
    };
  }
}
