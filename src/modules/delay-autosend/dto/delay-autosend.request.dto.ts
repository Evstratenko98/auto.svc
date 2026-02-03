import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { DELAY_AUTOSEND_SOURCE } from '../delay-autosend.constants';

export class DelayAutosendRequestDto {
  @ApiProperty({ example: 123 })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ type: [Object], example: [{ id: 1 }] })
  @IsArray()
  @ArrayNotEmpty()
  offers: unknown[];

  @ApiProperty({ enum: DELAY_AUTOSEND_SOURCE, example: DELAY_AUTOSEND_SOURCE.WEB })
  @IsEnum(DELAY_AUTOSEND_SOURCE)
  source: DELAY_AUTOSEND_SOURCE;

  @ApiPropertyOptional({ description: 'Delay in minutes', example: 45, default: 30 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  delay?: number;
}
