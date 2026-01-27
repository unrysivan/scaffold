from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.item import Item
from app.schemas.item import ItemCreate, ItemUpdate


class ItemService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(
        self, skip: int = 0, limit: int = 10
    ) -> tuple[list[Item], int]:
        # Get total count
        count_query = select(func.count()).select_from(Item)
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0

        # Get items
        query = select(Item).offset(skip).limit(limit).order_by(Item.id.desc())
        result = await self.db.execute(query)
        items = list(result.scalars().all())

        return items, total

    async def get_by_id(self, item_id: int) -> Item | None:
        query = select(Item).where(Item.id == item_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def create(self, data: ItemCreate) -> Item:
        item = Item(**data.model_dump())
        self.db.add(item)
        await self.db.flush()
        await self.db.refresh(item)
        return item

    async def update(self, item_id: int, data: ItemUpdate) -> Item | None:
        item = await self.get_by_id(item_id)
        if not item:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(item, field, value)

        await self.db.flush()
        await self.db.refresh(item)
        return item

    async def delete(self, item_id: int) -> bool:
        item = await self.get_by_id(item_id)
        if not item:
            return False

        await self.db.delete(item)
        await self.db.flush()
        return True
