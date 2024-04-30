import styled from '@emotion/styled';
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

const ListStyle = {
  background: 'lightgrey',
  width: 'fit-content',
  padding: 8,
};


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
          <div {...provided.droppableProps} ref={provided.innerRef} style={ListStyle}>
            {items.map((item, idx) => (
              <Draggable key={item.id} draggableId={item.id} index={idx}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                  >
                    {item.groupName}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default GroupsSidebar;

type DummyGroupDataType = {
  id: string;
  groupName: string;
  groupImage: string;
  members: string[];
};

const DummyGroupData: DummyGroupDataType[] = [
  {
    id: '1',
    groupName: 'Group name 1',
    groupImage: '',
    members: ['ray', 'ray2'],
  },
  {
    id: '2',
    groupName: 'Group name 2',
    groupImage: '',
    members: ['ray', 'ray2'],
  },
  {
    id: '3',
    groupName: 'Group name 3',
    groupImage: '',
    members: ['ray', 'ray2'],
  },
];
