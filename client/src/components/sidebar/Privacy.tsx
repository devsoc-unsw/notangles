import { ExpandMore } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Link, Typography } from '@mui/material';
import { styled } from '@mui/system';
import React from 'react';

const privacyQuestions = [
  {
    title: 'Who we are',
    content: (
      <>
        <p>
          DevSoc is an Australian, student-run society at UNSW Sydney, affiliated with UNSW Arc, and registered as an
          ACNC not-for-profit organisation.
        </p>
        <ul>
          <li>
            <strong>General Enquiries:</strong> <a href="mailto:contact@devsoc.app">contact@devsoc.app</a>
          </li>
          <li>
            <strong>Registration Address:</strong> Computer Science Building (K17), Engineering Road, UNSW Sydney,
            Kensington NSW 2052, Australia
          </li>
          <li>DevSoc became an ACNC registered not-for-profit organisation in 2024.</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Information we collect',
    content: (
      <>
        <p>We collect the following categories of information:</p>
        <ul>
          <li>
            <strong>Timetable data:</strong> The timetable you create is stored locally in your browser’s local storage
            on your device.
          </li>
          <li>
            <strong>Account information (when you choose to sign in):</strong> We store your username, full name,
            profile picture, and a copy of your timetable data in our remote database so you can access it across
            devices.
          </li>
        </ul>
        <p>We do not intentionally collect sensitive information (e.g., health or financial data).</p>
      </>
    ),
  },
  {
    title: 'How we use your information',
    content: (
      <>
        <ul>
          <li>Provide, operate, and improve the Application (including syncing your timetable when signed in).</li>
          <li>Authenticate users and secure the Application.</li>
          <li>Diagnose errors and maintain performance.</li>
        </ul>
        <p>We do not sell or rent your personal information.</p>
      </>
    ),
  },
  {
    title: 'Cookies, local storage, and consent',
    content: (
      <p>
        The Application uses browser <strong>local storage</strong> to save your timetable on your device. For
        analytics, we implement <strong>Microsoft Clarity Consent Mode</strong>. Under this configuration,{' '}
        <strong>Clarity cookies are disabled</strong> by default and remain disabled unless you grant consent through
        our in-app controls. If you do not grant consent, Clarity operates with cookies disabled.
      </p>
    ),
  },
  {
    title: 'Analytics and monitoring tools',
    content: (
      <ul>
        <li>
          We use Microsoft Clarity to understand aggregate interaction patterns and improve usability. Clarity is run
          under <strong>Consent Mode with cookies disabled by default</strong>.
        </li>
      </ul>
    ),
  },
  {
    title: 'Legal bases (Australia)',
    content: (
      <p>
        We collect and use personal information as reasonably necessary for our functions and activities, and with your
        consent where required (e.g., analytics under Clarity Consent Mode). You may withdraw consent at any time via
        the controls provided in the Application; withdrawal will not affect prior processing lawfully conducted.
      </p>
    ),
  },
  {
    title: 'Sharing of information',
    content: (
      <ul>
        <li>
          <strong>Service providers:</strong> We may share information with trusted vendors who help us operate the
          Application (e.g., hosting, analytics, error monitoring), subject to confidentiality and data protection
          obligations.
        </li>
        <li>
          <strong>Legal and safety:</strong> We may disclose information if required by law or to protect the rights,
          property, or safety of DevSoc, our members, users, or others.
        </li>
        <li>
          <strong>With your direction:</strong> We may share information when you ask us to or consent to us doing so.
        </li>
      </ul>
    ),
  },
  {
    title: 'Data storage, location, and retention',
    content: (
      <ul>
        <li>
          <strong>Local storage:</strong> Timetable data stored locally remains on your device unless you sign in and
          choose to sync.
        </li>
        <li>
          <strong>Remote database:</strong> Account data (username, full name, profile picture, and timetable) is stored
          securely by us to provide your account features.
        </li>
        <li>
          <strong>Third-party processors:</strong> Our service providers may process data in other countries subject to
          appropriate safeguards.
        </li>
        <li>
          <strong>Retention:</strong> We keep personal information only as long as needed to provide the Application,
          comply with legal obligations, or resolve disputes. You can request deletion of your account data at any time.
        </li>
      </ul>
    ),
  },
  {
    title: 'Security',
    content: (
      <p>
        We implement technical and organisational measures designed to protect personal information. No system is
        completely secure; users should keep their login credentials confidential and use up-to-date software and
        devices.
      </p>
    ),
  },
  {
    title: 'Your choices and rights',
    content: (
      <>
        <ul>
          <li>
            <strong>Access and correction:</strong> You can request access to, or correction of, your personal
            information.
          </li>
          <li>
            <strong>Deletion:</strong> You can request deletion of your account and associated timetable data stored in
            our remote database.
          </li>
        </ul>
        <p>
          To exercise these rights, contact us at <a href="mailto:contact@devsoc.app">contact@devsoc.app</a>.
        </p>
      </>
    ),
  },
  {
    title: 'Third-party links',
    content: (
      <p>
        The Application may link to third-party websites or applications. Their privacy and security practices are not
        covered by this Privacy Policy.
      </p>
    ),
  },
  {
    title: 'Contact',
    content: (
      <p>
        If you have any questions or concerns regarding privacy on our website, please send us a message at&nbsp;
        <Link target="_blank" href="mailto:notangles@devsoc.app">
          notangles@devsoc.app
        </Link>
        . We will make every effort to resolve your concerns.
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
      // Warning: This key only works because the list is stable
      <StyledAccordion key={index}>
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
          <Typography component={'div'} gutterBottom variant="body2">
            {content}
          </Typography>
        </StyledAccordionDetails>
      </StyledAccordion>
    );
  });

  return (
    <>
      <StyledDialogBody gutterBottom variant="body2">
        This Privacy Policy explains how DevSoc (“we”, “us”) collects, uses, and protects personal information in
        connection with our application (“Application”). By using or accessing the Application, you acknowledge that you
        have read this Privacy Policy.
      </StyledDialogBody>
      {privacyMap}
      <FooterText gutterBottom variant="body2">
        Effective Date: 10<sup>th</sup> September, 2025
      </FooterText>
    </>
  );
};

export default Privacy;
