import { Module, Global } from '@nestjs/common';
import { JsonStorageService } from './services/json-storage.service';

/**
 * Common module providing shared services and utilities
 * Marked as @Global so it can be used throughout the application
 */
@Global()
@Module({
  providers: [JsonStorageService],
  exports: [JsonStorageService],
})
export class CommonModule {}
