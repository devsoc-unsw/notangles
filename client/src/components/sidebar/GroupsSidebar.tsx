import styled from '@emotion/styled';
import { Tooltip } from '@mui/material';
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

const GROUP_CIRCLE_SIZE = 65;

const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
  borderRadius: 999,
  height: GROUP_CIRCLE_SIZE,
  width: GROUP_CIRCLE_SIZE,

  userSelect: 'none', // cursor doesn't select text
  marginBottom: 8,
  background: isDragging ? 'lightblue' : 'grey',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  ...draggableStyle, // styles we need to apply on draggables
});

const StyledContainer = styled('div')`
  background: ${({ theme }) => theme.palette.primary.main};
  width: fit-content;
  padding: 8px;
`

///////////////   COPIED FROM ADDGROUPBUTTON ///////////////
const Circle = `
  width: 150px;
  height: 150px;
  border-radius: 999px;
`;

const CircleOutline = styled('div')`
  ${Circle}
  border: 1px solid gray;
  cursor: pointer;
  &:hover {
    border: ${({ theme }) => (theme.palette.mode === 'light' ? '1px solid black' : '1px solid white;')};
  }
`;
//////////////////////////////////////////////////////////////////////////////////////////

const GroupsSidebar = () => {
  const [items, setItems] = useState(DummyGroupData);

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

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={'droppable'}>
        {(provided, snapshot) => (
          <StyledContainer {...provided.droppableProps} ref={provided.innerRef}>
            {items.map((item, idx) => (
              <Draggable key={item.id} draggableId={item.id} index={idx}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                  >
                    <Tooltip title={item.groupName} placement='right'>
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
            ))}
            {provided.placeholder}
          </StyledContainer>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default GroupsSidebar;

type DummyGroupDataType = {
  id: string;
  groupName: string;
  groupImageURL: string;
  members: string[];
};

const DummyGroupData: DummyGroupDataType[] = [
  {
    id: '1',
    groupName: 'Group name 1',
    groupImageURL:
      'https://static.vecteezy.com/system/resources/previews/023/506/852/non_2x/cute-kawaii-mushroom-chibi-mascot-cartoon-style-vector.jpg',
    members: ['ray', 'ray2'],
  },
  {
    id: '2',
    groupName: 'Group name 2',
    groupImageURL: 'https://wallpapers-clan.com/wp-content/uploads/2022/05/cute-pfp-07.jpg',
    members: ['ray', 'ray2'],
  },
  {
    id: '3',
    groupName: 'Group name 3',
    groupImageURL: 'https://wallpapers-clan.com/wp-content/uploads/2023/12/cute-cat-in-custume-pfp-01.jpg',
    members: ['ray', 'ray2'],
  },
];
