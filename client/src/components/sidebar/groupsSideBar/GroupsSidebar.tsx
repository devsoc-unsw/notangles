import styled from '@emotion/styled';
import { Menu, MenuItem, Tooltip } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { API_URL } from '../../../api/config';
import NetworkError from '../../../interfaces/NetworkError';
import AddGroupDialog, { Group } from '../addGroupDialog/AddGroupDialog';
import NotanglesLogo from '../../../assets/notangles_1.png';

const GROUP_CIRCLE_SIZE = 45;

const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
  borderRadius: 999,
  height: GROUP_CIRCLE_SIZE,
  width: GROUP_CIRCLE_SIZE,

  userSelect: 'none', // cursor doesn't select text
  background: isDragging ? 'lightblue' : 'grey',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  ...draggableStyle, // styles we need to apply on draggables
});

const StyledContainer = styled('div')`
  height: 100%;
  width: fit-content;

  position: fixed;
  background: ${({ theme }) => theme.palette.primary.main};
  padding: 12px 8px;
  z-index: 1201; /* overriding https://material-ui.com/customization/z-index/ */

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const StyledGroupsList = styled('div')`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const GroupsSidebar = () => {
  const [userId, setUserId] = useState<string>('');
  const [groups, setGroups] = useState<Group[]>([]);

  const getGroups = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_URL.server}/user/group/${userId}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      if (res.status !== 200) throw new NetworkError("Couldn't get response");
      const jsonData = await res.json();
      setGroups(jsonData.data.groups);
    } catch (error) {
      throw new NetworkError(`Couldn't get response cause encountered error: ${error}`);
    }
  };

  useEffect(() => {
    getGroups();
  }, [userId]);

  useEffect(() => {
    const getZid = async () => {
      try {
        const response = await fetch(`${API_URL.server}/auth/user`, {
          credentials: 'include',
        });
        const userResponse = await response.text();
        if (userResponse !== '') setUserId(JSON.parse(userResponse));
      } catch (error) {
        console.log(error);
      }
    };
    getZid();
  }, []);

  // Reorders the given list by moving the value at startIndex to endIndex.
  const reorder = (list: any, startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1); // delete value at startIndex
    result.splice(endIndex, 0, removed); // insert 'removed' value into endIndex
    return result;
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return; // if dropped outside the list
    const reorderedItems: any = reorder(groups, result.source.index, result.destination.index);
    setGroups(reorderedItems);
  };

  const [contextMenu, setContextMenu] = React.useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
          // Other native context menus might behave different.
          // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
          null,
    );
  };

  const handleClose = () => setContextMenu(null);

  const handleDeleteGroup = async (groupId: string) => {
    try {
      const res = await fetch(`${API_URL.server}/group/${groupId}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const groupDeleteStatus = await res.json();
      console.log('res', res);
      if (res.status === 200) {
        handleClose();
        getGroups();
      } else {
        throw new NetworkError("Couldn't get response");
      }
    } catch (error) {
      throw new NetworkError(`Couldn't get response cause encountered error: ${error}`);
    }
  };

  return (
    <StyledContainer>
      <AddGroupDialog getGroups={getGroups} userId={userId} />
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={'droppable'}>
          {(provided, snapshot) => (
            <StyledGroupsList {...provided.droppableProps} ref={provided.innerRef}>
              {groups.map((group, idx) => (
                <div onContextMenu={handleContextMenu}>
                  <Menu
                    open={contextMenu !== null}
                    onClose={handleClose}
                    anchorReference="anchorPosition"
                    anchorPosition={
                      contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined
                    }
                  >
                    <AddGroupDialog groupData={group} getGroups={getGroups} userId={userId} />
                    <MenuItem onClick={() => handleDeleteGroup(group.id)}>Delete</MenuItem>
                  </Menu>
                  <Draggable key={group.id} draggableId={group.id} index={idx}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                      >
                        <Tooltip title={group.name} placement="right">
                          <img
                            src={group.imageURL || NotanglesLogo}
                            width={GROUP_CIRCLE_SIZE}
                            height={GROUP_CIRCLE_SIZE}
                            style={{ borderRadius: 999, backgroundColor: 'white' }}
                          />
                        </Tooltip>
                      </div>
                    )}
                  </Draggable>
                </div>
              ))}
              {provided.placeholder}
            </StyledGroupsList>
          )}
        </Droppable>
      </DragDropContext>
    </StyledContainer>
  );
};

export default GroupsSidebar;
