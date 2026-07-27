import { request, type APIRequestContext } from '@playwright/test';
import { env } from '../config/env';

/** Thin typed wrapper over the Toolshop REST API — logs in, then issues authenticated writes.
 *  ADR-002 designates this the seeding entry point, but seeding is not built yet: only the
 *  write path has a caller. Read helpers get added when something needs them, not kept as
 *  dead code that nothing exercises. */
export class ApiClient {
  private constructor(
    private readonly ctx: APIRequestContext,
    private readonly token: string,
  ) {}

  static async loginAs(email: string, password: string): Promise<ApiClient> {
    const ctx = await request.newContext({ baseURL: env.apiUrl });
    const res = await ctx.post('/users/login', { data: { email, password } });
    if (!res.ok()) throw new Error(`Login failed (${res.status()}): ${await res.text()}`);
    const { access_token } = (await res.json()) as { access_token: string };
    return new ApiClient(ctx, access_token);
  }

  private authHeaders() {
    return { Authorization: `Bearer ${this.token}` };
  }

  async post(path: string, data: unknown) {
    return this.ctx.post(path, { data, headers: this.authHeaders() });
  }

  async dispose(): Promise<void> {
    await this.ctx.dispose();
  }
}
