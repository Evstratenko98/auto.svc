import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DelayAutosendService } from './delay-autosend.service';
import { DelayAutosendRequestDto, DelayAutosendResponseDto } from './dto/delay-autosend.dto';

@ApiTags('delay-autosend')
@Controller({ path: 'delay-autosend', version: '1' })
export class DelayAutosendController {
  constructor(private readonly delayAutosendService: DelayAutosendService) {}

  @Post()
  @ApiOperation({ summary: 'Schedule delayed autosend' })
  @ApiResponse({ status: 201, type: DelayAutosendResponseDto })
  async schedule(@Body() body: DelayAutosendRequestDto): Promise<DelayAutosendResponseDto> {
    return this.delayAutosendService.scheduleAutosend(body);
  }
}
