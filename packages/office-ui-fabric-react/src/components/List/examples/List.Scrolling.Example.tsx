import * as React from 'react';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { List, ScrollToMode } from 'office-ui-fabric-react/lib/List';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { createListItems, IExampleItem } from '@uifabric/example-data';
import { mergeStyleSets, getTheme, normalize } from 'office-ui-fabric-react/lib/Styling';

const theme = getTheme();

const styles = mergeStyleSets({
  container: {
    overflow: 'auto',
    maxHeight: 500,
    marginTop: 20,
    selectors: {
      '.ms-List-cell:nth-child(odd)': {
        height: 50,
        lineHeight: 50,
        background: theme.palette.neutralLighter
      },
      '.ms-List-cell:nth-child(even)': {
        height: 25,
        lineHeight: 25
      }
    }
  },
  itemContent: [
    theme.fonts.medium,
    normalize,
    {
      position: 'relative',
      display: 'block',
      borderLeft: '3px solid ' + theme.palette.themePrimary,
      paddingLeft: 27
    }
  ]
});

export interface IListScrollingExampleProps {
  items?: IExampleItem[];
}

export interface IListScrollingExampleState {
  selectedIndex: number;
  scrollToMode: ScrollToMode;
  showItemIndexInView: boolean;
}

const evenItemHeight = 25;
const oddItemHeight = 50;
const numberOfItemsOnPage = 10;

export class ListScrollingExample extends React.Component<IListScrollingExampleProps, IListScrollingExampleState> {
  private _list: List<IExampleItem>;
  private _items: IExampleItem[];

  constructor(props: IListScrollingExampleProps) {
    super(props);

    this._items = props.items || createListItems(5000);
    this.state = {
      selectedIndex: 0,
      scrollToMode: ScrollToMode.auto,
      showItemIndexInView: false
    };
  }

  public render() {
    return (
      <FocusZone direction={FocusZoneDirection.vertical}>
        <div>
          <DefaultButton onClick={this._scrollRelative(-10)}>-10</DefaultButton>
          <DefaultButton onClick={this._scrollRelative(-1)}>-1</DefaultButton>
          <DefaultButton onClick={this._scrollRelative(1)}>+1</DefaultButton>
          <DefaultButton onClick={this._scrollRelative(10)}>+10</DefaultButton>
        </div>
        <Dropdown
          placeholder="Select an Option"
          label="Scroll To Mode:"
          ariaLabel="Scroll To Mode"
          defaultSelectedKey={'auto'}
          options={[
            { key: 'auto', text: 'Auto' },
            { key: 'top', text: 'Top' },
            { key: 'bottom', text: 'Bottom' },
            { key: 'center', text: 'Center' }
          ]}
          onChange={this._onDropdownChange}
        />
        <div>
          Scroll item index:
          <TextField value={this.state.selectedIndex.toString(10)} onChange={this._onChangeText} />
        </div>
        <div>
          <Checkbox
            label="Show index of the first item in view when unmounting"
            checked={this.state.showItemIndexInView}
            onChange={this._onShowItemIndexInViewChanged}
          />
        </div>
        <div className={styles.container} data-is-scrollable={true}>
          <List ref={this._resolveList} items={this._items} getPageHeight={this._getPageHeight} onRenderCell={this._onRenderCell} />
        </div>
      </FocusZone>
    );
  }

  public componentWillUnmount() {
    if (this.state.showItemIndexInView) {
      const itemIndexInView = this._list!.getStartItemIndexInView(
        idx => (idx % 2 === 0 ? evenItemHeight : oddItemHeight) /* measureItem */
      );
      alert('unmounting, getting first item index that was in view: ' + itemIndexInView);
    }
  }

  private _getPageHeight(idx: number): number {
    let h = 0;
    for (let i = idx; i < idx + numberOfItemsOnPage; ++i) {
      const isEvenRow = i % 2 === 0;

      h += isEvenRow ? evenItemHeight : oddItemHeight;
    }
    return h;
  }

  private _onChangeText = (ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value: string): void => {
    this._scroll(parseInt(value, 10) || 0, this.state.scrollToMode);
  };

  private _onDropdownChange = (event: React.FormEvent<HTMLDivElement>, option: IDropdownOption) => {
    let scrollMode = this.state.scrollToMode;
    switch (option.key) {
      case 'auto':
        scrollMode = ScrollToMode.auto;
        break;
      case 'top':
        scrollMode = ScrollToMode.top;
        break;
      case 'bottom':
        scrollMode = ScrollToMode.bottom;
        break;
      case 'center':
        scrollMode = ScrollToMode.center;
        break;
    }
    this._scroll(this.state.selectedIndex, scrollMode);
  };

  private _onRenderCell = (item: IExampleItem, index: number): JSX.Element => {
    return (
      <div data-is-focusable={true}>
        <div className={styles.itemContent}>
          {index} &nbsp; {item.name}
        </div>
      </div>
    );
  };

  private _scrollRelative = (delta: number): (() => void) => {
    return (): void => {
      this._scroll(this.state.selectedIndex + delta, this.state.scrollToMode);
    };
  };

  private _scroll = (index: number, scrollToMode: ScrollToMode): void => {
    const updatedSelectedIndex = Math.min(Math.max(index, 0), this._items.length - 1);

    this.setState(
      {
        selectedIndex: updatedSelectedIndex,
        scrollToMode: scrollToMode
      },
      () => {
        this._list.scrollToIndex(updatedSelectedIndex, idx => (idx % 2 === 0 ? evenItemHeight : oddItemHeight), scrollToMode);
      }
    );
  };

  private _resolveList = (list: List<IExampleItem>): void => {
    this._list = list;
  };

  private _onShowItemIndexInViewChanged = (event: React.FormEvent<HTMLInputElement>, checked: boolean): void => {
    this.setState({
      showItemIndexInView: checked
    });
  };
}
