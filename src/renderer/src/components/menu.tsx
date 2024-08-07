import { handleIntercom } from "@renderer/utils/intercom";
import "../assets/menu.css";
import { LeftMenuProps, MenuProps, PositionType } from "@renderer/types/panel";

export const Menu = ({
    items,
    clickable,
    setStationType
}: MenuProps) => {
    return (
        <div className="menu">
            {items.map((item) => (
                <button
                    onClick={() =>
                        clickable
                            ? setStationType(item.stationType as PositionType)
                            : null}
                    key={item.id}
                    className="menu-item"
                >
                    {item.label}
                </button>
            ))}
        </div>
    )
}

export const LeftMenu = ({
    items,
}: LeftMenuProps) => {
    return (
        <div className="menu">
            {items.map((item) => (
                <button
                    onClick={() => handleIntercom({ type: item.id })}
                    key={item.id}
                    className="menu-item"
                >
                    {item.label}
                </button>
            ))}
        </div>
    )
}