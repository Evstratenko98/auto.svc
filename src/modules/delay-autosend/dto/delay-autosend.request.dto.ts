import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { DELAY_AUTOSEND_SOURCE } from '../delay-autosend.constants';
import { CsOffer } from '../../credit-selection/credit-selection.types';
import { OFFER_EXAMPLE } from '../../credit-selection/credit-selection.constants';

export class DelayAutosendRequestDto {
  @ApiProperty({ example: 123 })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ description: 'CalcId', example: '1' })
  @IsString()
  @IsNotEmpty()
  calcId: string;

  @ApiProperty({ type: [Object], example: [OFFER_EXAMPLE] })
  @IsArray()
  @ArrayNotEmpty()
  offers: CsOffer[];

  @ApiProperty({ enum: DELAY_AUTOSEND_SOURCE, example: DELAY_AUTOSEND_SOURCE.WEB })
  @IsEnum(DELAY_AUTOSEND_SOURCE)
  source: DELAY_AUTOSEND_SOURCE;

  @ApiPropertyOptional({ description: 'Delay in minutes', example: 45, default: 30 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  delay?: number;
}
