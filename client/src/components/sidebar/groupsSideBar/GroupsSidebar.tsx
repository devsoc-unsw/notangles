import styled from '@emotion/styled';
import { Menu, MenuItem, Tooltip } from '@mui/material';
import React, { useState } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';

import { API_URL } from '../../../api/config';
import NetworkError from '../../../interfaces/NetworkError';
import AddGroupDialog from '../addGroupDialog/AddGroupDialog';
import { DummyGroupData } from './dummyData';

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

const GroupsSidebar = () => {
  const [items, setItems] = useState(DummyGroupData);

  const getGroups = async () => {
    console.log('fetching groups...');
    return;

    try {
      const res = await fetch(`${API_URL.server}/user/group/:zid`, { //TODO fetch zid
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (res.status !== 201) throw new NetworkError("Couldn't get response");

      const getGroupStatus = await res.json();
      console.log(getGroupStatus);

    } catch (error) {
      throw new NetworkError(`Couldn't get response cause encountered error: ${error}`);
    }
  }

  // Reorders the given list by moving the value at startIndex to endIndex.
  const reorder = (list: any, startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1); // delete value at startIndex
    result.splice(endIndex, 0, removed); // insert 'removed' value into endIndex
    return result;
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return; // if dropped outside the list
    const reorderedItems: any = reorder(items, result.source.index, result.destination.index);
    setItems(reorderedItems);
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

  const handleClose = () => {
    setContextMenu(null);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={'droppable'}>
        {(provided, snapshot) => (
          <StyledContainer {...provided.droppableProps} ref={provided.innerRef}>
            {items.map((item, idx) => (
            <div onContextMenu={handleContextMenu} style={{ cursor: 'context-menu' }}>
              <Menu
                open={contextMenu !== null}
                onClose={handleClose}
                anchorReference="anchorPosition"
                anchorPosition={
                  contextMenu !== null
                    ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                    : undefined
                }
              >
                <MenuItem onClick={handleClose}>Edit</MenuItem>
                <MenuItem onClick={handleClose}>Delete</MenuItem>
              </Menu>
              <Draggable key={item.id} draggableId={item.id} index={idx}>
                
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                  >
                    <Tooltip title={item.groupName} placement="right">
                      <img
                        src={item.groupImageURL}
                        width={GROUP_CIRCLE_SIZE}
                        height={GROUP_CIRCLE_SIZE}
                        style={{ borderRadius: 999 }}
                      />
                    </Tooltip>
                  </div>
                )}
              </Draggable>
              </div>
            ))}
            {provided.placeholder}
            <AddGroupDialog getGroups={getGroups} />
          </StyledContainer>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default GroupsSidebar;
