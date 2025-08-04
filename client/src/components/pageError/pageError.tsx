import { styled } from '@mui/system';
import logo from '../../assets/notanglesWithBg.png';

const PageWrapper = styled('div')`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  gap: 2rem;
`;

const LoadingLogo = styled('img')`
  width: 200px;
  border-radius: 50%;
  animation: spin 3s linear infinite;
`;

const Button = styled('button')`
  padding: 1rem 2rem;
  background-color: #3b76f8;
  color: white;
  border: none;
  border-radius: 1rem;
  cursor: pointer;
  font-size: 1.2rem;
  &:hover {
    background-color: #0170f3;
  }
`;

const ErrorMessage = styled('p')`
  color: red;
  font-size: 1.2rem;
`;

const HintMessage = styled('p')`
  color: #555;
  font-size: 1rem;
`;

const Link = styled('a')`
  color: #3b76f8;
  text-decoration: underline;
  cursor: pointer;
  &:hover {
    color: #0170f3;
  }
`;

const MessageWrapper = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const PageError = () => (
  <PageWrapper>
    <LoadingLogo src={logo} alt="Notangles Logo" />
    <MessageWrapper>
      <ErrorMessage>Oops! It seems we've hit a snag in the Notangles.</ErrorMessage>
      <HintMessage>Don’t worry, even the best angles sometimes get tangled. You can:</HintMessage>
      <Button onClick={() => (window.location.href = '/home')}>Return to Notangles</Button>
      <HintMessage>
        Still stuck? <Link href="https://discord.com/invite/u9p34WUTcs">Report the issue</Link> on Discord, and we'll
        untangle it for you!
      </HintMessage>
    </MessageWrapper>
  </PageWrapper>
);

export default PageError;
