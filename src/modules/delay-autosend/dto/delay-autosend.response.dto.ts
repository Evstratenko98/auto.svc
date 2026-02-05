import { ApiProperty } from '@nestjs/swagger';

export class DelayAutosendResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'delayautosend_123' })
  jobId: string;
}
