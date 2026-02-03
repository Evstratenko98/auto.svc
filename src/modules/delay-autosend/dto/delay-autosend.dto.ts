import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export enum DelayAutosendSource {
    WEB = 'WEB',
    APP = 'APP',
}

export class DelayAutosendRequestDto {
    @ApiProperty({ example: 123 })
    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @ApiProperty({ type: [Object], example: [{ offerId: 1 }] })
    @IsArray()
    @ArrayNotEmpty()
    offers: unknown[];

    @ApiProperty({ enum: DelayAutosendSource, example: DelayAutosendSource.WEB })
    @IsEnum(DelayAutosendSource)
    source: DelayAutosendSource;

    @ApiPropertyOptional({ description: 'Delay in minutes', example: 45, default: 30 })
    @IsOptional()
    @IsNumber()
    @Min(1)
    delay?: number;
}

export class DelayAutosendResponseDto {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: 'delayautosend_123' })
    jobId: string;
}
