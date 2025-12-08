import { Test, TestingModule } from '@nestjs/testing';
import { WeatherExportController } from '../../../src/modules/weather/controllers/weather-export.controller';
import { WeatherExportService } from '../../../src/modules/weather/services/weather-export.service';
import { ExportWeatherQueryDto } from '../../../src/modules/weather/dtos/export-weather-query.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../../src/common/guards/roles.guard';

// Mock do WeatherExportService
const mockWeatherExportService = {
  generateCsv: jest.fn(),
  generateXlsx: jest.fn(),
};

// Mock dos guards (sempre permitem)
const mockAuthGuard = { canActivate: jest.fn(() => true) };
const mockRolesGuard = { canActivate: jest.fn(() => true) };

describe('WeatherExportController', () => {
  let controller: WeatherExportController;
  let exportService: WeatherExportService;
  let res: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeatherExportController],
      providers: [
        { provide: WeatherExportService, useValue: mockWeatherExportService },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<WeatherExportController>(WeatherExportController);
    exportService = module.get<WeatherExportService>(WeatherExportService);

    res = {
      setHeader: jest.fn(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------------------
  // exportCsv
  // -----------------------------------------

  describe('exportCsv', () => {
    it('deve chamar o service.generateCsv e retornar CSV com headers corretos', async () => {
      // Arrange:
      const query: ExportWeatherQueryDto = {
        start: '2025-11-01T00:00:00Z',
        end: '2025-11-02T00:00:00Z',
        cityName: 'Brasília',
        cityQueryKey: 'brasilia_df',
      };
      const csvContent = 'recordedAt,cityName,cityQueryKey,temperature,humidity,windSpeed\n...';
      (exportService.generateCsv as jest.Mock).mockResolvedValueOnce(csvContent);

      // Act:
      await controller.exportCsv(query, res);

      // Assert:
      expect(exportService.generateCsv).toHaveBeenCalledWith(query);
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv; charset=utf-8');
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename="weather-logs.csv"',
      );
      expect(res.send).toHaveBeenCalledWith(csvContent);
    });
  });

  // -----------------------------------------
  // exportXlsx
  // -----------------------------------------

  describe('exportXlsx', () => {
    it('deve chamar o service.generateXlsx e retornar XLSX com headers corretos', async () => {
      // Arrange:
      const query: ExportWeatherQueryDto = {
        cityName: 'Brasília',
        cityQueryKey: 'brasilia_df',
      };
      const buffer = Buffer.from('xlsx-binary-data');
      (exportService.generateXlsx as jest.Mock).mockResolvedValueOnce(buffer);

      // Act:
      await controller.exportXlsx(query, res);

      // Assert:
      expect(exportService.generateXlsx).toHaveBeenCalledWith(query);
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename="weather-logs.xlsx"',
      );
      expect(res.send).toHaveBeenCalledWith(buffer);
    });
  });
});
