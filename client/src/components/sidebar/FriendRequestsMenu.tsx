import { Button, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { useQueryClient } from '@tanstack/react-query';

import { useAcceptFriendRequest, useDeleteFriendRequest } from '../../api/friendship/mutations';
import { useIncomingRequestsQuery, useOutgoingRequestsQuery } from '../../api/friendship/queries';
import { FriendInfo } from '../../interfaces/User';
import UserProfile from './friends/UserProfile';

const RequestRow = styled('div')`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
  width: 100%;
`;

const ProfileSlot = styled('div')`
  flex: 1;
  min-width: 0;
`;

const ActionGroup = styled('div')`
  display: flex;
  gap: 6px;
  flex-shrink: 0;
`;

const SectionLabel = styled(Typography)`
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.palette.text.secondary};
  padding: 12px 0 4px;
`;

const AcceptButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontSize: '0.75rem',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '&:hover': { backgroundColor: theme.palette.primary.dark },
}));

const RejectButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontSize: '0.75rem',
  backgroundColor: theme.palette.grey[300],
  color: theme.palette.text.primary,
  '&:hover': { backgroundColor: theme.palette.grey[400] },
}));

const CancelButton = styled(RejectButton)``;

const Container = styled('div')`
  width: 100%;
`;

const EmptyText = styled(Typography)`
  text-align: center;
  padding: 16px 0;
`;

const FriendRequestsMenu = () => {
  const incoming = useIncomingRequestsQuery();
  const outgoing = useOutgoingRequestsQuery();
  const queryClient = useQueryClient();
  const accept = useAcceptFriendRequest(queryClient);
  const deleteRequest = useDeleteFriendRequest(queryClient);

  const hasAny = incoming.length > 0 || outgoing.length > 0;

  const renderRequest = (req: FriendInfo, actions: React.ReactNode) => (
    <RequestRow key={req.id}>
      <ProfileSlot>
        <UserProfile
          sidebarCollapsed={false}
          firstName={req.firstName}
          lastName={req.lastName}
          profilePictureUrl={req.profilePictureUrl}
        />
      </ProfileSlot>
      <ActionGroup>{actions}</ActionGroup>
    </RequestRow>
  );

  return (
    <Container>
      {!hasAny && <EmptyText color="text.secondary">No pending requests</EmptyText>}

      {incoming.length > 0 && (
        <>
          <SectionLabel>Incoming</SectionLabel>
          {incoming.map((req) =>
            renderRequest(
              req,
              <>
                <AcceptButton
                  size="small"
                  disableElevation
                  disabled={accept.isPending || deleteRequest.isPending}
                  onClick={() => {
                    accept.mutate(req.id);
                  }}
                >
                  Accept
                </AcceptButton>
                <RejectButton
                  size="small"
                  disableElevation
                  disabled={accept.isPending || deleteRequest.isPending}
                  onClick={() => {
                    deleteRequest.mutate(req.id);
                  }}
                >
                  Reject
                </RejectButton>
              </>,
            ),
          )}
        </>
      )}

      {outgoing.length > 0 && (
        <>
          <SectionLabel>Sent</SectionLabel>
          {outgoing.map((req) =>
            renderRequest(
              req,
              <CancelButton
                size="small"
                disableElevation
                disabled={deleteRequest.isPending}
                onClick={() => {
                  deleteRequest.mutate(req.id);
                }}
              >
                Cancel
              </CancelButton>,
            ),
          )}
        </>
      )}
    </Container>
  );
};

export default FriendRequestsMenu;
