import { useRouter } from 'next/router';

const ActivationPage = () => {
  const router = useRouter();
  const { token } = router.query;

  // Logic to handle the token (e.g., verify the activation code)

  return (
    <div>
      <h1>Account Activation</h1>
      <p>Your activation code: {token}</p>
    </div>
  );
};

export default ActivationPage;
