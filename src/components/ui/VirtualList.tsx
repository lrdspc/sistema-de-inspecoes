import React from 'react';
import { List, AutoSizer, ListRowProps } from 'react-virtualized';

interface VirtualListProps<T> {
  items: T[];
  rowHeight: number;
  renderRow: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export function VirtualList<T>({
  items,
  rowHeight,
  renderRow,
  className,
}: VirtualListProps<T>) {
  const rowRenderer = ({ index, key, style }: ListRowProps) => {
    const item = items[index];
    return (
      <div key={key} style={style}>
        {renderRow(item, index)}
      </div>
    );
  };

  return (
    <div className={className} style={{ height: '100%' }}>
      <AutoSizer>
        {({ width, height }) => (
          <List
            width={width}
            height={height}
            rowCount={items.length}
            rowHeight={rowHeight}
            rowRenderer={rowRenderer}
            overscanRowCount={5}
          />
        )}
      </AutoSizer>
    </div>
  );
}
