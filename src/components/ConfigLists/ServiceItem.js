import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import EnvList from './EnvList'
import Divider from '@material-ui/core/Divider';
import { SelectFileContext } from '../../Context/Contexts'
import { withRouter } from 'react-router-dom'
// icons
import Apps from '@material-ui/icons/Apps';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ExpandLess from '@material-ui/icons/ExpandLess';

const HIGHLIGHT_STYLE = { backgroundColor: "yellow" }

function generateTitle(heightLightText, text) {
    if (!heightLightText) return text
    let splitText = text.split(new RegExp(`(${heightLightText})`, 'gi'))
    if (splitText.length === 1) return text
    return (<div>
        {splitText.map((value, key) => {
            return <span key={key} style={value === heightLightText ? HIGHLIGHT_STYLE : {}}>{value}</span>
        })}
    </div>)
}

class ServiceItem extends React.Component {
    state = {
        open: false,
    };

    handleClick = (clickFile) => {
        this.setState(state => ({ open: !state.open }));
        clickFile("", "")
    };

    render() {
        const searchText = this.props.searchText
        const { name, description, environments, id } = this.props.service
        return (
            <SelectFileContext.Consumer>
                {({ clickFile, selectedService, selectedEnvironment }) => (
                    <div>
                        <ListItem button onClick={() => this.handleClick(clickFile)}>
                            <ListItemIcon>
                                <Apps />
                            </ListItemIcon>
                            <ListItemText inset primary={generateTitle(searchText, name)} secondary={generateTitle(searchText, description)} />
                            {this.state.open ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                        <EnvList open={this.state.open}
                            environments={environments}
                            isSelected={selectedService === id}
                            selectedEnvironment={selectedEnvironment}
                            addEnvironment={() => this.props.history.push(`new-service?serviceId=${id}`)}
                            clickFile={(envName) => clickFile(id, envName)} />
                        <Divider />
                    </div>
                )}
            </SelectFileContext.Consumer>)
    }
}

export default withRouter(ServiceItem);
