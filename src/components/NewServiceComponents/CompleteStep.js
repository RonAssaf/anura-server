import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles';
import { buttonStyle as styles } from './styles'
import PropTypes from 'prop-types';

class ConfigContainer extends Component {
    render() {
        const { classes } = this.props
        return (
            <Grid container spacing={24} className={classes.container}>
                <Grid item xs={12} sm={6} className={classes.container}>
                    <Button variant="contained"
                        color="primary"
                        className={classes.button}
                        classes={{ label: classes.buttonLabel }}
                        size="large"
                        onClick={this.props.addEnvironment}>
                        Add Environment
                    </Button>
                </Grid>
                <Grid item xs={12} sm={6} className={classes.container}>
                    <Button variant="contained"
                        color="primary"
                        className={classes.button}
                        classes={{ label: classes.buttonLabel }}
                        size="large"
                        onClick={this.props.complete}>
                        Complete
                    </Button>
                </Grid>

            </Grid >
        )
    }
}


ConfigContainer.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(ConfigContainer);