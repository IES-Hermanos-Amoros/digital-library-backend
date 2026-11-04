import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  check() {
    return {
      status: 'ok-workflow-github-actions',
      timestamp: new Date().toISOString(),
    };
  }
}
