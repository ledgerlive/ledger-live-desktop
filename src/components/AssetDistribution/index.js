// @flow

import React, { PureComponent } from 'react'
import { createSelector, createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { Trans } from 'react-i18next'
import { getAssetsDistribution } from '@ledgerhq/live-common/lib/portfolio'
import type { AssetsDistribution } from '@ledgerhq/live-common/lib/types/portfolio'
import styled from 'styled-components'
import Text from 'components/base/Text'
import IconAngleDown from 'icons/AngleDown'
import { calculateCountervalueSelector } from 'actions/general'
import Card from '../base/Box/Card'
import { accountsSelector } from '../../reducers/accounts'
import { counterValueCurrencySelector } from '../../reducers/settings'
import Row from './Row'
import Header from './Header'

type Props = {
  distribution: AssetsDistribution,
}

type State = {
  showAll: boolean,
}

const SeeAllButton = styled.div`
  margin-top: 15px;
  display: flex;
  color: ${p => p.theme.colors.wallet};
  align-items: center;
  justify-content: center;
  border-top: 1px solid ${p => p.theme.colors.lightFog};
  height: 40px;
  cursor: pointer;

  &:hover ${Text} {
    text-decoration: underline;
  }

  > :nth-child(2) {
    margin-left: 8px;
    transform: rotate(${p => (p.expanded ? '180deg' : '0deg')});
  }
`

const distributionSelector = createSelector(
  accountsSelector,
  calculateCountervalueSelector,
  (acc, calc) =>
    getAssetsDistribution(acc, calc, {
      minShowFirst: 6,
      maxShowFirst: 6,
      showFirstThreshold: 0.95,
    }),
)

const mapStateToProps = createStructuredSelector({
  distribution: distributionSelector,
  counterValueCurrency: counterValueCurrencySelector,
})

class AssetDistribution extends PureComponent<Props, State> {
  state = {
    showAll: false,
  }

  toggleShowAll = () => this.setState(prevState => ({ showAll: !prevState.showAll }))

  render() {
    const { distribution } = this.props
    const {
      showFirst: initialRowCount,
      list,
      list: { length: totalRowCount },
    } = distribution

    const { showAll } = this.state
    const almostAll = initialRowCount + 3 > totalRowCount
    const subList = showAll || almostAll ? list : list.slice(0, initialRowCount)

    return (
      <>
        <Text ff="Museo Sans|Regular" fontSize={6} color="dark">
          <Trans
            i18nKey="distribution.header"
            values={{ count: 0 }}
            count={distribution.list.length}
          />
        </Text>
        <Card p={0} mt={20}>
          <Header />
          {subList.map(item => (
            <Row key={item.currency.id} item={item} />
          ))}
          {!almostAll && (
            <SeeAllButton expanded={showAll} onClick={this.toggleShowAll}>
              <Text color="wallet" ff="Open Sans|SemiBold" fontSize={4}>
                <Trans i18nKey={showAll ? 'distribution.showLess' : 'distribution.showAll'} />
              </Text>
              <IconAngleDown size={16} />
            </SeeAllButton>
          )}
        </Card>
      </>
    )
  }
}

export default connect(mapStateToProps)(AssetDistribution)
