import { TextInput, PasswordInput, Button, Paper, Title, Container, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { useGlobalModals } from '../store/globalModals';

const LoginPage = () => {
  const setUser = useGlobalModals((state) => state.setUser);
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
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/user/login`, {
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
      setUser(data.user);
      navigate('/');
      Cookies.set('authToken', data.token, { secure: true, sameSite: 'Strict', expires: 1 });

    } catch (error) {
      alert(error.message);
      console.error('Error during login:', error.message);
    }
  };

  return (
    <Container size={400} className='h-screen flex justify-center items-center'>
      <Paper withBorder shadow="sm" radius="lg" p={30} style={{ backgroundColor: '#f9fafc' }}>
        <Title align="left" style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
          Login
        </Title>
        <Text align="center" color="dimmed" size="sm" mt={5}>
          Please Login using given Email and Password
        </Text>
        <form onSubmit={form.onSubmit(handleSubmit)} style={{ marginTop: '20px' }}>
          <Stack>
            <TextInput
              placeholder="get@ziontutorial.com"
              {...form.getInputProps('email')}
              radius="md"
              size="md"
              styles={{
                input: { backgroundColor: 'white', borderColor: '#e4e7eb', fontSize: '14px' },
              }}
              required
            />
            <PasswordInput
              placeholder="Password"
              {...form.getInputProps('password')}
              radius="md"
              size="md"
              styles={{
                input: { backgroundColor: 'white', borderColor: '#e4e7eb', fontSize: '14px' },
              }}
              required
            />
            <Button type="submit" fullWidth radius="md" size="md" style={{ backgroundColor: '#3b82f6' }}>
              Log in
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default LoginPage;
