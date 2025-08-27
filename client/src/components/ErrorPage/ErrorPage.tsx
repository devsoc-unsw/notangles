import { styled } from '@mui/material/styles';

import logo from '../../assets/notanglesWithBg.png';
import { NotanglesBlue, NotanglesHoverBlue } from '../../constants/theme';

const PageWrapper = styled('div')`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  gap: 2rem;
  padding-top: 10%;
`;

const LoadingLogo = styled('img')`
  width: 200px;
  border-radius: 50%;
  animation: spin 3s linear infinite;
`;

const Button = styled('button')`
  padding: 1rem 2rem;
  background-color: ${NotanglesBlue};
  color: white;
  border: none;
  border-radius: 1rem;
  cursor: pointer;
  font-size: 1.2rem;
  &:hover {
    background-color: ${NotanglesHoverBlue};
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
  color: ${NotanglesBlue};
  text-decoration: underline;
  cursor: pointer;
  &:hover {
    color: ${NotanglesHoverBlue};
  }
`;

const MessageWrapper = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const ErrorWrapper = styled('div')`
  background-color: #f8d7da;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #f5c6cb;
  color: #721c24;
  margin-top: 1rem;
  text-align: left;
  width: 80%;
`;

const ErrorStack = styled('pre')`
  color: #f00;
  font-size: 0.9rem;
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
`;

interface PageErrorProps {
  errorStack: Error;
}

const PageError: React.FC<PageErrorProps> = ({ errorStack }) => {
  return (
    <PageWrapper>
      <LoadingLogo src={logo} alt="Notangles Logo" />
      <MessageWrapper>
        <ErrorMessage>{"Oops! It seems we've hit a snag in the Notangles."}</ErrorMessage>
        <HintMessage>{"Don't worry, even the best angles sometimes get tangled. You can:"}</HintMessage>
        <Button onClick={() => (window.location.href = '/home')}>Return to Notangles</Button>
        <HintMessage>
          {'Still stuck?'}
          <Link href="https://discord.com/invite/u9p34WUTcs">Report the issue</Link>
          {"on Discord, and we'll untangle it for you!"}
        </HintMessage>

        <ErrorWrapper>
          <strong>Error Details:</strong>
          <ErrorStack>
            {errorStack.message}
            {errorStack.stack ? `\n${errorStack.stack}` : ''}
          </ErrorStack>
        </ErrorWrapper>
      </MessageWrapper>
    </PageWrapper>
  );
};

export default PageError;
