import { GroupInfo } from '..';

export interface ISemaphoreGroupService {
  fetchGroupInfo(groupId: string): Promise<GroupInfo>;
}
export class MockSemaphoreService implements ISemaphoreGroupService {
  // TODO: this is a mock implementation
  fetchGroupInfo(groupId: string): Promise<GroupInfo> {
    return Promise.resolve({
      id: groupId,
      depth: 20,
      members: [
        '18247677939749764709615722514754949329375911953462583983649646599131197861128',
      ],
    });
  }
}
