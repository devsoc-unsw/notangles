import React from 'react';
import { ExpandMore } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Theme, Typography } from '@mui/material';
import { styled } from '@mui/system';

const privacyQuestions = [
  {
    title: 'What personal information does Notangles collect?',
    content: (
      <>
        <p>We collect the following types of information from our users:</p>
        <p>
          Personal Information You Provide to Us: We may receive and store any information you submit to the Application (or
          otherwise authorize us to obtain – such as, from (for example) your Facebook account). The types of personal information
          collected may include your username, email address, profile picture, friends that are also using the Application, and
          any other information necessary for us to provide the Application services.
        </p>
      </>
    ),
  },
  {
    title: 'How does Notangles use the information it collects?',
    content: (
      <p>
        Notangles uses the information described in this Privacy Statement (i) internally, to analyze, develop and improve its
        products and services, and (ii) as set forth below in the “Will Notangles share any of the personal information it
        receives” section below.
      </p>
    ),
  },
  {
    title: 'Will Notangles share any of the personal information it receives?',
    content: (
      <>
        <p>
          Personal information about our users is an integral part of our business. We neither rent nor sell your personal
          information to anyone.
        </p>
        <p>
          Protection of Notangles and Others: We may release personal information when we believe in good faith that release is
          necessary to comply with the law; enforce or apply our conditions of use and other agreements; or protect the rights,
          property, or safety of Notangles, our employees, our users, or others. This includes exchanging information with other
          companies and organizations for fraud protection and credit risk reduction.
        </p>
        <p>
          With Your Consent: Except as set forth above, you will be notified when your personal information may be shared with
          third parties, and will be able to prevent the sharing of this information.
        </p>
      </>
    ),
  },
  {
    title: 'Conditions of use.',
    content: (
      <p>
        If you decide to use or otherwise access the Application, your use/access and any possible dispute over privacy is subject
        to this Privacy Statement and our Terms of Use, including limitations on damages, arbitration of disputes, and application
        of California state law.
      </p>
    ),
  },
  {
    title: 'Third party applications/websites.',
    content: (
      <p>
        The Application may permit you to link to other applications or websites. Such third party applications/websites are not
        under Notangles’s control, and such links do not constitute an endorsement by Notangles of those other
        applications/websites or the services offered through them. The privacy and security practices of such third party
        application/websites linked to the Application are not covered by this Privacy Statement, and Notangles is not responsible
        for the privacy or security practices or the content of such websites.
      </p>
    ),
  },
  {
    title: 'What personal information can I access?',
    content: (
      <>
        <p>
          Notangles allows you to access the following information about you for the purpose of viewing, and in certain
          situations, updating that information. This list may change in the event the Application changes.
        </p>
        <ul>
          <li>Account and user profile information</li>
          <li>User e-mail address, if applicable</li>
          <li>Facebook profile information, if applicable</li>
          <li>User preferences</li>
          <li>Application specific data</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Changes to this privacy statement.',
    content: (
      <p>
        Notangles may amend this Privacy Statement from time to time. Use of information we collect now is subject to the Privacy
        Statement in effect at the time such information is used. If we make changes in the way we use personal information, we
        will notify you by posting an announcement on our Site or sending you an email. Users are bound by any changes to the
        Privacy Statement when he or she uses or otherwise accesses the Application after such changes have been first posted.
      </p>
    ),
  },
  {
    title: 'Questions or concerns.',
    content: (
      <p>
        If you have any questions or concerns regarding privacy on our Website, please send us a detailed message at
        notangles@csesoc.org.au. We will make every effort to resolve your concerns.
      </p>
    ),
  },
];

const StyledDialogBody = styled(Typography)`
  padding-bottom: 20px;
`;

const FooterText = styled(Typography)`
  text-align: right;
  padding-top: 20px;
`;

const StyledAccordion = styled(Accordion)`
  margin: auto;
`;

const StyledAccordionSummary = styled(AccordionSummary)`
  backgroundColor: ${({ theme }) => theme.palette.background.default};,
  color: ${({ theme }) => theme.palette.primary.main};,
  border-color: ${({ theme }) => theme.palette.secondary.main};
`;

const StyledAccordionDetails = styled(AccordionDetails)`
  backgroundColor: ${({ theme }) => theme.palette.background.default};,
  color: ${({ theme }) => theme.palette.primary.main};,
  border-color: ${({ theme }) => theme.palette.secondary.main};
`;

const StyledTitle = styled(Typography)`
  && {
    font-weight: bold;
  }
`;

const Privacy: React.FC = () => {
  const privacyMap = privacyQuestions.map(({ title, content }, index) => {
    return (
      <StyledAccordion style={{ margin: 'auto' }}>
        <StyledAccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls={`privacyPanel${index}-content`}
          id={`privacyPanel${index}-header`}
        >
          <StyledTitle gutterBottom variant="body2">
            {title}
          </StyledTitle>
        </StyledAccordionSummary>
        <StyledAccordionDetails>
          <Typography gutterBottom variant="body2">
            {content}
          </Typography>
        </StyledAccordionDetails>
      </StyledAccordion>
    );
  });

  return (
    <>
      <StyledDialogBody gutterBottom variant="body2">
        This privacy statement (“Privacy Statement”) applies to the treatment of personally identifiable information submitted by,
        or otherwise obtained from, you in connection with the associated application (“Application”). The Application is provided
        by Notangles (and may be provided by Notangles on behalf of a Notangles licensor or partner (“Application Partner”). By
        using or otherwise accessing the Application, you acknowledge that you accept the practices and policies outlined in this
        Privacy Statement.
      </StyledDialogBody>
      {privacyMap}
      <FooterText gutterBottom variant="body2">
        Effective Date: 11<sup>th</sup> October, 2020
      </FooterText>
    </>
  );
};

export default Privacy;
