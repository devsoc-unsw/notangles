import { Badge, styled } from "@mui/material";

const StyledBadge = styled(Badge)`
  & .MuiBadge-badge {
    background-color: #FF383C;
    color: white;
    font-weight: 700;
    font-size: 10px;
    height: 16px;
    min-width: 16px;
    padding: 0;
    border-radius: 50%;
  }
`;

interface PendingInvitesBadgeProps {
  count: number;
  showBadge?: boolean;
}

const PendingInvitesBadge = ({ count, showBadge = true }: PendingInvitesBadgeProps) => {
  return <StyledBadge badgeContent={showBadge && count > 0 ? count : 0} />;
};

export default PendingInvitesBadge;


