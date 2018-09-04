/**
 * 2017-11-02 11:14:24
 * @author liuxin
 * @description 数组的搜索扩展
 */
export enum CellMatchRuleType {
  // indexOf(value) > -1
  EXIST,
  // equal
  FULL,
}
export interface IColMatchRule {
  col: string;
  type: CellMatchRuleType;
}
export interface IRowMatchRule {
  // 所有cols中的列都命中，该行命中
  cols: string[];
}
export interface ISearchRule {
  cols?: IColMatchRule[];
  rows?: IRowMatchRule[];
}

export class SearchArray<T> {
  public data: T[];

  constructor(data: T[] = []) {
    this.setData(data);
  }

  setData(data: T[]) {
    this.data = data;
    return this;
  }

  public filter(search: string, {
    cols,
    rows,
  }: ISearchRule = {}, data?: T[]): T[] {
    const defaultSearchRule = this._getDefaultSearchRule();

    if (!cols || !rows) {
      if (!defaultSearchRule) {
        throw new Error('Please input search rules!');
      }
    }

    cols = cols || defaultSearchRule.cols;
    rows = rows || defaultSearchRule.rows;
    const sourceData = data ? data : this.data;

    const filterData = sourceData.filter(item => {
      const hitCols = cols.filter(colRule => {
        switch (colRule.type) {
          case CellMatchRuleType.FULL: {
            return String(item[colRule.col]) === search;
          }
          case CellMatchRuleType.EXIST:
          default:
            return (String(item[colRule.col])).toLowerCase().indexOf(search.toLowerCase()) > -1;
        }
      });

      return rows.filter(rowRule => {
        return rowRule.cols.filter(col => hitCols.find(hitCol => hitCol.col === col)).length === rowRule.cols.length;
      }).length > 0;
    });

    return filterData;
  }

  /**
   * search数组中每一项是"或"关系，在data中遍历结果，然后去重
   */
  public multiFilter(search: string[], rule: ISearchRule = {}): T[] {
    let multiFilterData = this.data;

    if (Object.prototype.toString.call(search) === '[object Array]' && search.length > 0) {
      multiFilterData = [];

      search.forEach(v => {
        Array.prototype.concat.call(multiFilterData, this.filter(String(v), rule));
      });

      multiFilterData = Array.from(new Set(multiFilterData));
    }

    return multiFilterData;
  }

  /**
   * search split过后的数组中每一项是"与"关系
   */
  public spaceFilter(search: string, rule: ISearchRule = {}): T[] {
    const searches = search.trim().split(' ');
    let spaceFilterData = this.data;

    if (searches.length > 0) {
      searches.forEach(s => {
        spaceFilterData = this.filter(s, rule, spaceFilterData);
      });
    }

    return spaceFilterData;
  }

  private _getDefaultSearchRule(): ISearchRule {
    const _data = this.data || [];
    const _row = _data[0];

    if (!_row || Object.prototype.toString.call(_row) !== '[object Object]') {
      return {};
    }

    // 默认搜索所有列
    const cols: IColMatchRule[] = [];
    const rows: IRowMatchRule[] = [];

    Object.keys(_row).forEach(k => {
      cols.push({
        col: k,
        type: CellMatchRuleType.EXIST,
      });
      rows.push({
        cols: [k],
      });
    });

    return {
      cols,
      rows,
    };
  }

}
