export class Node<T> {
  public next: Node<T> | null = null;
  constructor(public data: T) {}
}

export interface ILinkedList<T> {
  insertAtEnd(data: T): Node<T>;
  traverse(): T[];
  size(): number;
  search(comparator: (data: T) => boolean): Node<T> | null;
}

export class LinkedList<T> implements ILinkedList<T> {
  private head: Node<T> | null = null;
  get headNode(): Node<T> | null {
    return this.head;
  }

  constructor(array: T[] = []) {
    const instance = new LinkedList<T>();
    array.forEach((data) => instance.insertAtEnd(data));
    return instance;
  }

  public insertAtEnd(data: T): Node<T> {
    const node = new Node(data);
    if (!this.head) {
      this.head = node;
    } else {
      const getLast = (node: Node<T>): Node<T> => {
        return node.next ? getLast(node.next) : node;
      };
      const lastNode = getLast(this.head);
      lastNode.next = node;
    }
    return node;
  }

  public search(comparator: (data: T) => boolean): Node<T> | null {
    const checkNext = (node: Node<T>): Node<T> | null => {
      if (comparator(node.data)) {
        return node;
      }
      return node.next ? checkNext(node.next) : null;
    };
    return this.head ? checkNext(this.head) : null;
  }

  public traverse(): T[] {
    const array: T[] = [];
    if (!this.head) {
      return array;
    }
    const addToArray = (node: Node<T>): T[] => {
      array.push(node.data);
      return node.next ? addToArray(node.next) : array;
    };
    return addToArray(this.head);
  }

  public size(): number {
    return this.traverse().length;
  }
}
