import { DroppedCardsProps } from '../../interfaces/PropTypes';
import React, { useContext, useLayoutEffect, useRef, useState } from 'react';
import { CSSTransition } from 'react-transition-group';

import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { Activity, ClassPeriod, ClassTime, CourseCode, EventPeriod } from '../../interfaces/Periods';

import { ClassCard, morphCards, transitionTime } from '../../utils/Drag';
import DroppedClass from './DroppedClass';
import DroppedEvent from './DroppedEvent'
import { getClashes, groupClashes, sortClashesByDay, getClashInfo } from './Clashes';
import { classTranslateX } from '../../utils/translateCard';
import {transitionName} from "../../styles/DroppedCardStyles"

const DroppedCards: React.FC<DroppedCardsProps> = ({ assignedColors, handleSelectClass }) => {
    const [cardKeys] = useState<Map<ClassCard, number>>(new Map<ClassCard, number>());

    const { earliestStartTime } = useContext(AppContext);
    const { selectedCourses, selectedClasses, createdEvents } = useContext(CourseContext);

    const droppedClasses: JSX.Element[] = [];
    const droppedEvents: JSX.Element[] = [];

    const prevClassCards = useRef<ClassCard[]>([]);
    const classCards: ClassCard[] = [];
    const eventCards: EventPeriod[] = [];

    const keyCounter = useRef(0);
    const inventoryCards = useRef<ClassCard[]>([]);

    const getInventoryPeriod = (courseCode: CourseCode, activity: Activity) =>
        selectedCourses.find((course) => course.code === courseCode)?.inventoryData[activity];

    Object.entries(selectedClasses).forEach(([courseCode, activities]) => {
        Object.entries(activities).forEach(([activity, classData]) => {
            if (classData) {
                classData.periods.forEach((classPeriod) => {
                    classCards.push(classPeriod);
                });
            } else {
                // in inventory
                const inventoryPeriod = getInventoryPeriod(courseCode, activity);
                if (inventoryPeriod) {
                    classCards.push(inventoryPeriod);

                    if (!inventoryCards.current.includes(inventoryPeriod)) {
                        inventoryCards.current.push(inventoryPeriod);
                    }
                }
            }
        });
    });

    // Clear any inventory cards which no longer exist
    inventoryCards.current = inventoryCards.current.filter((card) => classCards.includes(card));

    const prevCardKeys = new Map(cardKeys);
    morphCards(prevClassCards.current, classCards).forEach((morphCard, i) => {
        const prevCard = prevClassCards.current[i];

        if (morphCard && morphCard !== prevCard) {
            const cardKey = prevCardKeys.get(prevCard);

            if (cardKey) {
                cardKeys.set(morphCard as ClassCard, cardKey);
            }
        }
    });

    // Handles getting width of a cell in the grid
    const myRef = React.useRef<HTMLDivElement>(null);
    const [cellWidth, setCellWidth] = useState(0);
    useLayoutEffect(() => {
        const updateCellWidth = () => {
            if (myRef.current) {
                const gridChildren = (myRef.current as unknown as HTMLDivElement).parentElement?.children;

                if (gridChildren) {
                    setCellWidth(gridChildren[Math.floor(gridChildren.length / 2)].getBoundingClientRect().width);
                }
            }
        };
        window.addEventListener('resize', updateCellWidth);
        updateCellWidth();
        return () => window.removeEventListener('resize', updateCellWidth);
    }, []);

    const clashes = getClashes();
    const sortedClashes = sortClashesByDay(clashes);
    const groupedClashes = groupClashes(sortedClashes);

    classCards.forEach((classCard) => {
        let key = cardKeys.get(classCard);
        key = key !== undefined ? key : ++keyCounter.current;

        const [cardWidth, clashIndex, clashColour] = getClashInfo(groupedClashes, classCard);

        console.log(cardWidth, clashIndex, clashColour)

        droppedClasses.push(
            <DroppedClass
                key={key}
                classCard={classCard}
                color={assignedColors[classCard.class.course.code]}
                y={classCard.type === 'inventory' ? inventoryCards.current.indexOf(classCard) : undefined}
                handleSelectClass={handleSelectClass}
                cardWidth={cardWidth as number}
                clashIndex={clashIndex as number}
                clashColour={clashColour as string}
                cellWidth={cellWidth}
            />
        );

        cardKeys.set(classCard, key);
    });

    prevClassCards.current = [...classCards];

    // Sort by key to prevent disruptions to transitions
    droppedClasses.sort((a, b) => (a.key && b.key ? Number(a.key) - Number(b.key) : 0));

    cardKeys.forEach((_, classCard) => {
        if (!classCards.includes(classCard)) {
            cardKeys.delete(classCard);
        }
    });

    Object.entries(createdEvents).forEach(([key, eventPeriod]) => {
        const [cardWidth, clashIndex, _] = getClashInfo(groupedClashes, eventPeriod);
        droppedEvents.push(
            <DroppedEvent key={key} eventId={key} eventPeriod={eventPeriod}
                cardWidth={cardWidth as number}
                clashIndex={clashIndex as number}
                cellWidth={cellWidth}
            />)
    });


    return (
        // <CSSTransition style={{ display: 'contents' }} transitionName={transitionName} timeout={transitionTime}>
        // </CSSTransition>
        <div style={{ display: 'contents' }} >
            <div ref={myRef}>{droppedClasses}</div>
            <div>{droppedEvents}</div>
        </div>
    );

}

export default DroppedCards;