export type DummyGroupDataType = {
  id: string;
  groupName: string;
  groupImageURL: string;
  members: string[];
};

export const DummyGroupData: DummyGroupDataType[] = [
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
