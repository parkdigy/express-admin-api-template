import '../../src/init/global.types';
import excel from '../../src/common/excel';

describe('excel', () => {
  let res: MyResponse;

  beforeEach(() => {
    res = {
      attachment: jest.fn(() => res),
      send: jest.fn(),
    } as unknown as MyResponse;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should export Excel with correct data', () => {
    const fileName = 'test.xlsx';
    const rawData = [
      { name: 'John', age: 25, city: 'New York' },
      { name: 'Jane', age: 30, city: 'London' },
    ];
    excel.export(res, fileName, rawData, [
      excel.newColumn('Name', 'name'),
      excel.newColumn('Age', 'age'),
      excel.newColumn('City', 'city'),
    ]);

    expect(res.attachment).toHaveBeenCalledWith(fileName);
    expect(res.send).toHaveBeenCalled();
  });
});
