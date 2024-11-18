
import { TextInput, PasswordInput, Button, Paper, Title, Container, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
const LoginPage = () => {
  const navigate = useNavigate();
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length >= 6 ? null : 'Password must be at least 6 characters'),
    },
  });

  const handleSubmit = async (values) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      console.log('Login successful:', data);
      navigate('/');
      // Store token in HttpOnly cookie
      Cookies.set('authToken', data.token, { secure: true, sameSite: 'Strict', expires: 1 }); // Expires in 1 day
      console.log('Token stored in cookies');

    } catch (error) {
      console.error('Error during login:', error.message);
    }
  };
  return (
    <Container size={420} my={40}>
      <Title align="center" style={{ fontFamily: 'Greycliff CF, sans-serif', fontWeight: 900 }}>
        Welcome back!
      </Title>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Email"
              placeholder="you@example.com"
              {...form.getInputProps('email')}
              required
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              {...form.getInputProps('password')}
              required
            />
            <Button type="submit" fullWidth>
              Login
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default LoginPage;
