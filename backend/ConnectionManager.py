from typing import Dict, Optional
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.waiting: Optional[WebSocket] = None
        self.pairs: Dict[WebSocket, WebSocket] = {}

    def match(self, ws: WebSocket) -> Optional[WebSocket]:
        if self.waiting is None:
            self.waiting = ws
            return None

        partner = self.waiting
        self.waiting = None

        self.pairs[ws] = partner
        self.pairs[partner] = ws
        return partner

    def get_partner(self, ws: WebSocket) -> Optional[WebSocket]:
        return self.pairs.get(ws)

    def disconnect(self, ws: WebSocket) -> Optional[WebSocket]:
        partner = self.pairs.pop(ws, None)

        if partner:
            self.pairs.pop(partner, None)

        if self.waiting == ws:
            self.waiting = None

        return partner
