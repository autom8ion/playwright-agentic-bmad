import { test, expect } from '@fixtures';
import { buildUser } from '@factories/user.factory';

test.describe('Users API', () => {
  test('registered user can log in and fetch their profile @smoke', async ({ api, request, newUser }) => {
    const token = await api.login(newUser.email, newUser.password);

    const res = await request.get('/users/me', { headers: { Authorization: `Bearer ${token}` } });
    await expect(res).toBeOK();
    expect(await res.json()).toEqual(
      expect.objectContaining({ email: newUser.email, first_name: newUser.first_name }),
    );
  });

  test('registration rejects a duplicate email @regression', async ({ request, newUser }) => {
    const res = await request.post('/users/register', { data: buildUser({ email: newUser.email }) });

    expect(res.status()).toBe(409);
    expect(await res.json()).toEqual({ email: ['A customer with this email address already exists.'] });
  });

  test('registration requires mandatory fields @regression', async ({ request }) => {
    const res = await request.post('/users/register', { data: {} });

    expect(res.status()).toBe(422);
    expect(Object.keys(await res.json())).toEqual(
      expect.arrayContaining(['first_name', 'last_name', 'email', 'password']),
    );
  });

  test('login with a wrong password is unauthorized @regression', async ({ request, newUser }) => {
    const res = await request.post('/users/login', { data: { email: newUser.email, password: 'wrong' } });
    expect(res.status()).toBe(401);
  });
});
