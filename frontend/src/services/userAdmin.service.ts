import { AdminUser, CreateUserInput } from "@/types/admin";

const MOCK_USERS: AdminUser[] = [
    {
        _id: "user-1",
        name: "John Doe",
        email: "john@example.com",
        role: "user",
        status: "active",
        learningPathsCount: 2,
        createdAt: new Date("2024-01-10"),
        lastLoginAt: new Date("2024-02-15"),
    },
    {
        _id: "user-2",
        name: "Jane Smith",
        email: "jane@example.com",
        role: "user",
        status: "active",
        learningPathsCount: 1,
        createdAt: new Date("2024-01-15"),
        lastLoginAt: new Date("2024-02-14"),
    },
    {
        _id: "user-3",
        name: "Admin User",
        email: "admin@example.com",
        role: "admin",
        status: "active",
        learningPathsCount: 0,
        createdAt: new Date("2024-01-01"),
        lastLoginAt: new Date("2024-02-16"),
    },
];

class UserAdminService {
    private users: AdminUser[] = [...MOCK_USERS];

    async getAll(): Promise<{ code: number; data: AdminUser[] }> {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return { code: 200, data: this.users };
    }

    async getById(id: string): Promise<{ code: number; data: AdminUser | null }> {
        await new Promise((resolve) => setTimeout(resolve, 200));
        const user = this.users.find((u) => u._id === id);
        return { code: user ? 200 : 404, data: user || null };
    }

    async create(input: CreateUserInput): Promise<{ code: number; data: AdminUser }> {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const newUser: AdminUser = {
            _id: `user-${Date.now()}`,
            name: input.name,
            email: input.email,
            role: input.role,
            status: input.status,
            learningPathsCount: 0,
            createdAt: new Date(),
        };
        this.users.push(newUser);
        return { code: 201, data: newUser };
    }

    async update(id: string, input: Partial<CreateUserInput>): Promise<{ code: number; data: AdminUser | null }> {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const index = this.users.findIndex((u) => u._id === id);
        if (index === -1) return { code: 404, data: null };

        this.users[index] = {
            ...this.users[index],
            ...input,
        };

        return { code: 200, data: this.users[index] };
    }

    async delete(id: string): Promise<{ code: number; message: string }> {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const index = this.users.findIndex((u) => u._id === id);
        if (index === -1) return { code: 404, message: "User not found" };

        this.users.splice(index, 1);
        return { code: 200, message: "User deleted successfully" };
    }
}

export const userAdminService = new UserAdminService();
