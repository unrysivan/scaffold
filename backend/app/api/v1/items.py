from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas import ItemCreate, ItemUpdate, ItemResponse, PaginatedResponse
from app.services import ItemService

router = APIRouter()


def get_item_service(db: AsyncSession = Depends(get_db)) -> ItemService:
    return ItemService(db)


@router.get("", response_model=PaginatedResponse[ItemResponse])
async def list_items(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    service: ItemService = Depends(get_item_service),
):
    """获取项目列表"""
    skip = (page - 1) * size
    items, total = await service.get_all(skip=skip, limit=size)
    pages = (total + size - 1) // size if total > 0 else 0

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        size=size,
        pages=pages,
    )


@router.get("/{item_id}", response_model=ItemResponse)
async def get_item(
    item_id: int,
    service: ItemService = Depends(get_item_service),
):
    """获取单个项目"""
    item = await service.get_by_id(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.post("", response_model=ItemResponse, status_code=201)
async def create_item(
    data: ItemCreate,
    service: ItemService = Depends(get_item_service),
):
    """创建项目"""
    return await service.create(data)


@router.put("/{item_id}", response_model=ItemResponse)
async def update_item(
    item_id: int,
    data: ItemUpdate,
    service: ItemService = Depends(get_item_service),
):
    """更新项目"""
    item = await service.update(item_id, data)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.delete("/{item_id}", status_code=204)
async def delete_item(
    item_id: int,
    service: ItemService = Depends(get_item_service),
):
    """删除项目"""
    deleted = await service.delete(item_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Item not found")
