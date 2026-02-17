import React from 'react';
import StatusBadge from '../StatusBadge/StatusBadge';
import { getAvatarUrl } from '../../utils/avatars';
import './UserCard.css';

interface UserCardProps {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string;
  plan?: string;
  status: 'active' | 'expired';
  onClick?: () => void;
}

const UserCard: React.FC<UserCardProps> = ({
  id,
  name,
  email,
  avatarUrl,
  role,
  plan,
  status,
  onClick,
}) => {
  const avatar = avatarUrl || getAvatarUrl(id, name);

  return (
    <div className="user-card" onClick={onClick}>
      <div className="user-card__avatar">
        <img src={avatar} alt={name} />
      </div>
      <div className="user-card__info">
        <h3 className="user-card__name">{name}</h3>
        {role && <p className="user-card__role">{role}</p>}
        {plan && <p className="user-card__plan">{plan}</p>}
        <p className="user-card__email">{email}</p>
        <StatusBadge status={status} />
      </div>
    </div>
  );
};

export default UserCard;
