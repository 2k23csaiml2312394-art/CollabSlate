export type Tool =
  | 'pencil'
  | 'rectangle'
  | 'circle'
  | 'line'
  | 'arrow'
  | 'eraser'
  | 'select';

export interface Point {
  x: number;
  y: number;
}

export interface BaseElement {
  id: string;
  type: Tool;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
  createdBy?: string;
}

export interface PencilElement extends BaseElement {
  type: 'pencil' | 'eraser';
  points: Point[];
}

export interface RectangleElement extends BaseElement {
  type: 'rectangle';
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor: string;
}

export interface CircleElement extends BaseElement {
  type: 'circle';
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  fillColor: string;
}

export interface LineElement extends BaseElement {
  type: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface ArrowElement extends BaseElement {
  type: 'arrow';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export type CanvasElement =
  | PencilElement
  | RectangleElement
  | CircleElement
  | LineElement
  | ArrowElement;

export interface ViewTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export interface RemoteCursor {
  userId: string;
  userName: string;
  x: number;
  y: number;
  color: string;
}

export interface RoomUser {
  id: string;
  name: string;
  color: string;
}

export interface DrawingEvent {
  roomId: string;
  element: CanvasElement;
}

export interface CursorEvent {
  roomId: string;
  userId: string;
  userName: string;
  x: number;
  y: number;
  color: string;
}

export interface CanvasStateEvent {
  roomId: string;
  elements: CanvasElement[];
}

export interface UserJoinEvent {
  user: RoomUser;
  users: RoomUser[];
}

export interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
}
