export interface Target {
    _id: string;
    name: string;
    description?: string;
    key: string;
    tags: string[];
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateTargetInput {
    name: string;
    description?: string;
    key: string; // Must be uppercase, A-Z and numbers only
    tag: string; // Will be normalized to lowercase in tags array
}

export interface UpdateTargetInput extends Partial<CreateTargetInput> { }

export interface TargetOption {
    key: string;
    value: string;
}

export interface TargetListResponse {
    code: number;
    message: string;
    data: Target[];
    metadata?: {
        pageNum: number;
        pageSize: number;
        total: number;
    };
}
