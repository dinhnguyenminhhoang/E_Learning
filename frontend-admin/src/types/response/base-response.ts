export interface BaseResponse<T = any> {
  succeeded: boolean;
  message: string | null;
  code: string | null;
  data: T | null;
  errors: any;
  request: any;
  returnUrl: string | null;
}

export interface PaginatedResponse<T = any> {
  succeeded: boolean;
  message: string | null;
  code: string | null;
  data: T[];
  pagination: Pagination;
  errors: any;
}

export interface BaseSearchRequest {
  pageNum?: number;
  pageSize?: number;
  search?: string;
  searchBy?: string;
  sortBy?: string;
  sortDirection?: string;
  status?: string;
}

export interface ExtendBaseSearchRequest extends BaseSearchRequest {
  shouldGetAll?: boolean;
  roles?: string;
  startDate?: string;
  endDate?: string;
  createdOn?: string;
}

export interface Pagination {
  total: number;
  pageNum: number;
  pageSize: number;
}
