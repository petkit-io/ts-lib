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
  private _filterData: T[];
  private _multiFilterData: T[];

  constructor(data: T[] = []) {
    this.setData(data);
  }

  setData(data: T[]) {
    this.data = data;
    this._filterData = data;
    this._multiFilterData = [];
    return this;
  }

  public filter(search: string, {
    cols,
    rows,
  }: ISearchRule = {}, multiple = false): T[] {
    const defaultSearchRule = this._getDefaultSearchRule();

    if (!cols || !rows) {
      if (!defaultSearchRule) {
        return [];
      }
    }

    cols = cols || defaultSearchRule.cols;
    rows = rows || defaultSearchRule.rows;

    const toFilterData = multiple ? this._filterData : this.data;

    const filterData = toFilterData.filter(item => {
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

    if (!multiple) {
      this._filterData = filterData;
      return this.filterData;
    } else {
      this._multiFilterData.push(...filterData);
      return this.multiFilterData;
    }
  }

  public multiFilter(search: string[], rule: ISearchRule = {}) {
    if (search.length > 0) {
      search.forEach(v => {
        this.filter(String(v), rule, true);
      });

      this.endMultiFilter();
    }
  }

  public endMultiFilter() {
    this.setData(this.multiFilterData);
  }

  get filterData() {
    return this._filterData;
  }
  get multiFilterData() {
    return this._multiFilterData;
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
