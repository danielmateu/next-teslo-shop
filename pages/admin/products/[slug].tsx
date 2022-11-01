import { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next'

import { DriveFileRenameOutline, SaveOutlined, UploadOutlined } from '@mui/icons-material';
import { Box, Button, capitalize, Card, CardActions, CardMedia, Checkbox, Chip, Divider, FormControl, FormControlLabel, FormGroup, FormLabel, Grid, ListItem, Paper, Radio, RadioGroup, TextField } from '@mui/material';

import { AdminLayout } from '../../../components/layouts'
import { IProduct } from '../../../interfaces';
import { dbProducts } from '../../../database';
import { tesloApi } from '../../../api';
import { Product } from '../../../models';


const validTypes = ['shirts', 'pants', 'hoodies', 'hats']
const validGender = ['men', 'women', 'kid', 'unisex']
const validSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']

interface FormData {
    _id?        : string;
    description : string;
    images      : string[];
    inStock     : number;
    price       : number;
    sizes       : string[];
    slug        : string;
    tags        : string[];
    title       : string;
    type        : string;
    gender      : string
}

interface Props {
    product: IProduct;
}

const ProductAdminPage: FC<Props> = ({ product }) => {

    const router = useRouter()

    const [newTagValue, setNewTagValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const { register, handleSubmit, formState: { errors }, getValues, setValue, watch } = useForm<FormData>({
        defaultValues: product
    })


    useEffect(() => {

        const subscription = watch((value, { name, type }) => {
            // console.log({ value, type, name });
            if (name === 'title') {
                const newSlug = value.title?.trim().replaceAll(' ', '_').replaceAll("'", "").toLocaleLowerCase() || '';

                setValue('slug', newSlug)
            }

        })

        return () => subscription.unsubscribe();
    }, [watch, setValue])


    const onChangeSize = (size: string) => {

        /* Getting the values of the sizes object. */
        const currentSizes = getValues('sizes');

        /* Checking if the currentSizes array includes the size that was clicked. If it does, it will
        filter out the size that was clicked. */
        if (currentSizes.includes(size)) {
            return setValue('sizes', currentSizes.filter(s => s !== size), { shouldValidate: true })
        }

        setValue('sizes', [...currentSizes, size], { shouldValidate: true });
    }

    const onNewTag = () => {

        /* Trimming the value of the newTagValue variable and converting it to lowercase. */
        const newTag = newTagValue.trim().toLocaleLowerCase();
        setNewTagValue('');
        /* Getting the values of the tags from the form. */
        const currentTags = getValues('tags');

        /* Checking if the newTag is already in the currentTags array. If it is, it will return. */
        if(currentTags.includes(newTag)) {
            return;
        }

        /* Adding a new tag to the currentTags array. */
        currentTags.push(newTag);
        
    }

    const onDeleteTag = (tag: string) => {
        /* Filtering out the tag that was clicked on. */
        const updatedTags = getValues('tags').filter(t => t !== tag);
        setValue('tags', updatedTags, {shouldValidate: true });
    }

    const onSubmit = async(form: FormData) => {
        
        if(form.images.length < 2) return alert('Mínimo 2 imagenes');
        setIsSaving(true);

        try {
            const {data} = await tesloApi({
                url: '/admin/products',
                method: form._id ? 'PUT' : 'POST', //Si tenemos un _id, entonces actualizar, si no crear
                data: form
            });

            console.log({data});
            if(!form._id){
                //TODO: recargar el navegador
                router.replace(`/admin/products/${form.slug}`)
            }else{
                setIsSaving(false);
            }
        } catch (error) {
            console.log(error);
            setIsSaving(false);
        }


    }

    return (
        <AdminLayout
            title={'Producto'}
            subTitle={`Editando: ${product.title}`}
            icon={<DriveFileRenameOutline />}
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <Box display='flex' justifyContent='end' sx={{ mb: 1 }}>
                    <Button
                        color="secondary"
                        variant='outlined'
                        startIcon={<SaveOutlined />}
                        sx={{ width: '150px' }}
                        type="submit"
                        disabled={isSaving}
                    >
                        Guardar
                    </Button>
                </Box>

                <Grid container spacing={2}>
                    {/* Data */}
                    <Grid item xs={12} sm={6}>

                        <TextField
                            label="Título"
                            variant='standard'
                            fullWidth
                            sx={{ mb: 1 }}
                            {...register('title', {
                                required: 'Este campo es requerido',
                                minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                            })}
                            error={!!errors.title}
                            helperText={errors.title?.message}
                        />

                        <TextField
                            label="Descripción"
                            variant='standard'
                            fullWidth
                            multiline
                            sx={{ mb: 1 }}
                            {...register('description', {
                                required: 'Este campo es requerido',

                            })}
                            error={!!errors.description}
                            helperText={errors.description?.message}
                        />

                        <TextField
                            label="Inventario"
                            type='number'
                            variant="standard"
                            fullWidth
                            sx={{ mb: 1 }}
                            {...register('inStock', {
                                required: 'Este campo es requerido',
                                min: { value: 0, message: 'Mínimo 0 unidades' }
                            })}
                            error={!!errors.inStock}
                            helperText={errors.inStock?.message}
                        />

                        <TextField
                            label="Precio"
                            type='number'
                            variant="standard"
                            fullWidth
                            sx={{ mb: 1 }}
                            {...register('price', {
                                required: 'Este campo es requerido',
                                min: { value: 0, message: 'Valor mínimo debe ser 0' }
                            })}
                            error={!!errors.price}
                            helperText={errors.price?.message}
                        />

                        <Divider sx={{ my: 1 }} />

                        <FormControl sx={{ mb: 1 }}>
                            <FormLabel>Tipo</FormLabel>
                            <RadioGroup
                                row
                                value={getValues('type')}
                                onChange={({ target }) => setValue('type', target.value, { shouldValidate: true })}
                            // value={ status }
                            >
                                {
                                    validTypes.map(option => (
                                        <FormControlLabel
                                            key={option}
                                            value={option}
                                            control={<Radio color='secondary' />}
                                            label={capitalize(option)}
                                        />
                                    ))
                                }
                            </RadioGroup>
                        </FormControl>

                        <FormControl sx={{ mb: 1 }}>
                            <FormLabel>Género</FormLabel>
                            <RadioGroup
                                row
                                value={getValues('gender')}
                                onChange={({ target }) => setValue('gender', target.value, { shouldValidate: true })}
                            // value={ status }
                            // onChange={ onStatusChanged }
                            >
                                {
                                    validGender.map(option => (
                                        <FormControlLabel
                                            key={option}
                                            value={option}
                                            control={<Radio color='secondary' />}
                                            label={capitalize(option)}
                                        />
                                    ))
                                }
                            </RadioGroup>
                        </FormControl>

                        <FormGroup>
                            <FormLabel>Tallas</FormLabel>
                            {
                                validSizes.map(size => (
                                    <FormControlLabel
                                        key={size}
                                        control={<Checkbox checked={getValues('sizes').includes(size)} />}
                                        label={size}
                                        onChange={() => onChangeSize(size)}
                                    />
                                ))
                            }
                        </FormGroup>

                    </Grid>

                    {/* Tags e imagenes */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Slug - URL"
                            variant="standard"
                            fullWidth
                            sx={{ mb: 1 }}
                            {...register('slug', {
                                required: 'Este campo es requerido',
                                validate: (val) => val.trim().includes(' ') ? 'No pueden haber espacios en blanco' : undefined
                            })}
                            error={!!errors.slug}
                            helperText={errors.slug?.message}
                        />

                        <TextField
                            label="Etiquetas"
                            variant="standard"
                            fullWidth
                            sx={{ mb: 1 }}
                            helperText="Presiona [spacebar] para agregar"
                            value={newTagValue}
                            onChange = {({target}) => setNewTagValue(target.value)}
                            onKeyUp={({code}) => code === 'Space' ? onNewTag(): undefined}
                        />

                        <Box sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            listStyle: 'none',
                            p: 0,
                            m: 0,
                        }}
                            component="ul">
                            {
                                getValues('tags').map((tag) => {

                                    return (
                                        <Chip
                                            key={tag}
                                            label={tag}
                                            onDelete={() => onDeleteTag(tag)}
                                            color="primary"
                                            size='small'
                                            sx={{ ml: 1, mt: 1 }}
                                        />
                                    );
                                })}
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box display='flex' flexDirection="column">
                            <FormLabel sx={{ mb: 1 }}>Imágenes</FormLabel>
                            <Button
                                color="secondary"
                                variant='outlined'
                                fullWidth
                                startIcon={<UploadOutlined />}
                                sx={{ mb: 3 }}
                            >
                                Cargar imagen
                            </Button>

                            <Chip
                                label="Es necesario al menos 2 imagenes"
                                color='error'
                                variant='outlined'
                            />

                            <Grid container spacing={2}>
                                {
                                    product.images.map(img => (
                                        <Grid item xs={4} sm={3} key={img}>
                                            <Card>
                                                <CardMedia
                                                    component='img'
                                                    className='fadeIn'
                                                    image={`/products/${img}`}
                                                    alt={img}
                                                />
                                                <CardActions>
                                                    <Button
                                                        fullWidth
                                                        variant='outlined'
                                                        color="error"
                                                    >
                                                        Borrar
                                                    </Button>
                                                </CardActions>
                                            </Card>
                                        </Grid>
                                    ))
                                }
                            </Grid>

                        </Box>

                    </Grid>

                </Grid>
            </form>
        </AdminLayout>
    )
}

// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time


export const getServerSideProps: GetServerSideProps = async ({ query }) => {

    const { slug = '' } = query;

    let product: IProduct | null;

    if(slug === 'new'){
        //crear un producto
        const tempProduct = JSON.parse(JSON.stringify(new Product() ))
        delete tempProduct._id;
        tempProduct.images = ['img1.jpg','img2.jpg'];
        product = tempProduct;

    }else{
        product = await dbProducts.getProductBySlug(slug.toString());
    }

    if (!product) {
        return {
            redirect: {
                destination: '/admin/products',
                permanent: false,
            }
        }
    }


    return {
        props: {
            product
        }
    }
}


export default ProductAdminPage